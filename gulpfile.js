import gulp from 'gulp';
import eslint from 'gulp-eslint';
import env from 'gulp-env';
import request from 'request';
import { spawn, exec } from 'child_process';

gulp.task('build', () => (
  gulp.src('src/**/*.js')
    .pipe(gulp.dest('lib'))
));

gulp.task('lint', () => (
  gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
));

gulp.task('vitest', (done) => {
  const envs = env.set({
    NODE_ENV: 'test',
  });

  const vitestProcess = spawn('npx', ['vitest', 'run'], {
    stdio: 'inherit',
    env: { ...process.env, ...envs.vars }
  });

  vitestProcess.on('close', (code) => {
    envs.reset();
    done(code === 0 ? null : new Error(`Vitest failed with code ${code}`));
  });
});

gulp.task('test:integration', (done) => {
  const vitestProcess = spawn('npx', ['vitest', 'run', '--config', 'vitest.integration.config.js'], {
    stdio: 'inherit'
  });

  vitestProcess.on('close', (code) => {
    done(code === 0 ? null : new Error(`Integration tests failed with code ${code}`));
  });
});

gulp.task('test', gulp.parallel('lint', 'vitest'));

gulp.task('test:watch', () => (
  gulp.watch(['src/**/*.js', 'test/**/*.test.js'], gulp.series('test'))
));

// Keep the old mocha task for backwards compatibility during migration
gulp.task('mocha', (done) => {
  console.log('⚠️  mocha task is deprecated. Use "vitest" task instead.');
  console.log('Running vitest instead...');
  
  const vitestProcess = spawn('npx', ['vitest', 'run'], {
    stdio: 'inherit'
  });

  vitestProcess.on('close', (code) => {
    done(code === 0 ? null : new Error(`Tests failed with code ${code}`));
  });
});

gulp.task('default', gulp.series('build'));

import gulp from 'gulp';
import mocha from 'gulp-mocha';
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

gulp.task('mocha', () => {
  const envs = env.set({
    NODE_ENV: 'test',
  });

  return gulp.src(['test/**/*.js', '!test/integration.test.js'])
    .pipe(envs)
    .pipe(mocha())
    .pipe(envs.reset);
});

gulp.task('test:integration', () => gulp.src('test/integration.test.js').pipe(mocha({ timeout: 120000 })));

gulp.task('test', gulp.parallel('lint', 'mocha'));

gulp.task('test:watch', () => (
  gulp.watch(['src/**/*.js', 'test/**/*.test.js'], gulp.series('test'))
));

gulp.task('default', gulp.series('build'));

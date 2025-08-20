const gulp = require('gulp');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');
const env = require('gulp-env');
const request = require('request');
const { spawn, exec } = require('child_process');

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

const EUREKA_INIT_TIMEOUT = 60000;
const EUREKA_IMAGE = 'netflixoss/eureka:1.1.147';
const DOCKER_PORT = '8080';
const DOCKER_NAME = 'eureka-js-client';
const DOCKER_RUN_ARGS = [
  'run', '-d', '-p', `${DOCKER_PORT}:8080`, '--name', DOCKER_NAME, EUREKA_IMAGE,
];
const DOCKER_START_ARGS = [
  'start', DOCKER_NAME,
];

let startTime;
function waitForEureka(cb) {
  if (!startTime) startTime = +new Date();
  else if ((+new Date() - startTime) > EUREKA_INIT_TIMEOUT) {
    return cb(new Error('Eureka failed to start before timeout'));
  }
  request.get({ url: `http://localhost:${DOCKER_PORT}/eureka` }, (err) => {
    if (err) {
      if (err.code === 'ECONNRESET') {
        console.log('Eureka connection not ready. Waiting..'); // eslint-disable-line
        setTimeout(() => waitForEureka(cb), 1000);
      } else {
        cb(err);
      }
    } else {
      cb();
    }
  });
}

gulp.task('docker:run', (cb) => {
  exec(`docker ps -a | grep '\\b${DOCKER_NAME}\\b' | wc -l`, (error, stdout) => {
    const DOCKER_ARGS = (stdout.trim() === '1') ? DOCKER_START_ARGS : DOCKER_RUN_ARGS;
    const child = spawn('docker', DOCKER_ARGS, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code > 0) {
        cb(new Error('Failed to start docker image'));
      } else {
        waitForEureka(cb);
      }
    });
  });
});

gulp.task('test:integration', gulp.series('docker:run', () => (
  gulp.src('test/integration.test.js')
    .pipe(mocha({ timeout: 120000 }))
)));

gulp.task('test', gulp.parallel('lint', 'mocha'));

gulp.task('test:watch', () => (
  gulp.watch(['src/**/*.js', 'test/**/*.test.js'], gulp.series('test'))
));

gulp.task('default', gulp.series('build'));

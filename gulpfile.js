const gulp = require('gulp');
const replace = require('gulp-replace');
const concatES6 = require('./gulp-concat-es6');
gulp.task('demo', () => {
    return gulp.src(['./test/**/*'])
        .pipe(replace('../../src/', 'blacksocket.io/'))
        .pipe(gulp.dest('demo'))
});
gulp.task('es6', () => {
    return gulp.src(['./src/socket.js', './src/client.js'])
        .pipe(concatES6({
            name: 'blacksocket.es6'
        }))
        .pipe(gulp.dest('client'));
});
gulp.task('default', ['demo', 'es6']);
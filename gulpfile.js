const gulp = require('gulp');
const replace = require('gulp-replace');
gulp.task('demo', () => {
    return gulp.src(['./test/**/*'])
        .pipe(replace('../../src/', 'blacksocket.io/'))
        .pipe(gulp.dest('demo'))
});
gulp.task('default', ['demo']);
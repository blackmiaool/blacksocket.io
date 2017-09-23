const gulp = require('gulp');
const replace = require('gulp-replace');
gulp.task('demo', () => {
    return gulp.src(['./test/**/*'])
    .pipe(replace('../../', ''))
    .pipe(gulp.dest('demo'))
});
gulp.task('default',['demo']);
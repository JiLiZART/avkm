'use strict';

var gulp = require('gulp');

gulp.task('views', function () {
    return gulp.src('app/views/*.html')
        .pipe(gulp.dest('dist/views'));
});

'use strict';


var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    jscs = require('gulp-jscs'),
    errorHandler = require('../errorHandler');

gulp.task('jscs', function () {
    return gulp.src([
        '**/*.js',
        '!vendor/**/*'
    ], {cwd: 'app'})
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(jscs());
});

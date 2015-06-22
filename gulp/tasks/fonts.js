'use strict';

var gulp = require('gulp'),
    filter = require('gulp-filter'),
    flatten = require('gulp-flatten'),
    mainBowerFiles = require('main-bower-files'),
    path = require('path'),
    paths = require('../paths');

gulp.task('fonts', function () {
    return gulp.src(mainBowerFiles())
        .pipe(filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe(flatten())
        .pipe(gulp.dest(path.join(paths.dist, '/fonts/')));
});

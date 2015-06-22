'use strict';

var gulp = require('gulp'),
    paths = require('../paths'),
    ghPages = require('gulp-gh-pages');

gulp.task('ghpages', ['assets'], function () {
    return gulp.src(paths.dist + '/**/*')
        .pipe(ghPages());
});

'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    gulpif = require('gulp-if'),
    useref = require('gulp-useref'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    cmq = require('gulp-combine-media-queries'),
    minifyCss = require('gulp-minify-css'),
    csscomb = require('gulp-csscomb'),
    errorHandler = require('../errorHandler'),
    paths = require('../paths');

gulp.task('assets', ['fonts', 'views'], function () {
    var assets = useref.assets();

    return gulp.src('app/*.html')
        .pipe(plumber({errorHandler: errorHandler}))
        .pipe(assets)
        //.pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', autoprefixer()))
        .pipe(gulpif('*.css', cmq()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulpif('*.css', csscomb()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

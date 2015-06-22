'use strict';

var gutil = require('gulp-util');

module.exports = function (error) {
    gutil.log([
        (error.name + ' in ' + error.plugin).bold.red,
        error.message
    ].join('\n'));

    if (gutil.env.beep) {
        gutil.beep();
    }

    this.emit('end');
};

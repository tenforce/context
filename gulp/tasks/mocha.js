var gulp = require('gulp');
var mocha = require('gulp-mocha');

module.exports = function(){
    gulp.src('./tests/**/*.js').pipe(mocha({reporter: 'spec'}));
};

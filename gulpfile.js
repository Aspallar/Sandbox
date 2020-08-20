/*eslint-env node, es6 */
const gulp = require('gulp'),
    fileinclude = require('gulp-file-include'),
    rename = require('gulp-rename'),
    prettier = require('gulp-prettier');

async function buildCalculator() {
    var folder = 'src/calculator/',
        suffix = '-full';
    return gulp
        .src([`${folder}*.html`, `!${folder}*${suffix}.html`])
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(prettier())
        .pipe(rename({ suffix }))
        .pipe(gulp.dest(folder));
}

exports.default = buildCalculator;

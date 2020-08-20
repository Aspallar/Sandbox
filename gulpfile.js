/*eslint-env node, es6 */
const gulp = require('gulp'),
    fileinclude = require('gulp-file-include'),
    rename = require('gulp-rename'),
    prettier = require('gulp-prettier'),
    terser = require('gulp-terser');

const calculatorFolder = 'src/calculator/';

async function includeCalculator() {
    const suffix = '-full';
    return gulp
        .src([`${calculatorFolder}*.html`, `!${calculatorFolder}*${suffix}.html`])
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(prettier())
        .pipe(rename({ suffix }))
        .pipe(gulp.dest(calculatorFolder));
}

async function minifyCalculator() {
    const elementFolder = `${calculatorFolder}element/`,
        extname = '.min.js';
    return gulp
        .src([`${elementFolder}/*.js`, `!${elementFolder}/*${extname}`])
        .pipe(terser())
        .pipe(rename({ extname }))
        .pipe(gulp.dest(elementFolder));
}

exports.default = includeCalculator;
exports.calculatorAll = gulp.parallel(includeCalculator, minifyCalculator);

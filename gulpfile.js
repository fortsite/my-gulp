const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');

// sourcemap, rename, autoprefix, cleanCSS, browser-sync
/// STYLES
const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded',
      }).on('error', notify.onError())
    )
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream());
};

/// HTML ICLUDES
const htmlIncludes = () => {
  return src(['./src/index.html'])
    .pipe(
      fileinclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(dest('./app'))
    .pipe(browserSync.stream());
};

/// WATCH FILES
const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: './app',
    },
  });

  watch('./src/scss/**/*.scss', styles);
  watch('./src/index.html', htmlIncludes);
};

exports.styles = styles;
exports.htmlIncludes = htmlIncludes;
exports.watchFiles = watchFiles;

exports.default = series(htmlIncludes, styles, watchFiles);

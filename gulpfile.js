const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fs = require('fs');

// FONTS
const fonts = () => {
  src('./src/assets/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./app/assets/fonts/'));
  return src('./src/assets/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./app/assets/fonts/'));
};

const cb = () => {};

let srcFonts = './src/scss/_fonts.scss';
let appFonts = './app/assets/fonts/';

const fontsStyle = done => {
  let file_content = fs.readFileSync(srcFonts);

  fs.writeFile(srcFonts, '', cb);
  fs.readdir(appFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (var i = 0; i < items.length; i++) {
        let fontname = items[i].split('.');
        fontname = fontname[0];
        if (c_fontname != fontname) {
          fs.appendFile(
            srcFonts,
            '@include font-face("' +
              fontname +
              '", "' +
              fontname +
              '", 400);\r\n',
            cb
          );
        }
        c_fontname = fontname;
      }
    }
  });

  done();
};

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

/// IMG MOVE TO APP
const imgToApp = () => {
  return src([
    './src/assets/img/**.jpg',
    './src/assets/img/**.png',
    './src/assets/img/**.jpeg',
  ]).pipe(dest('./app/assets/img/'));
};

/// SVG SPRITE
const svgSprites = () => {
  return src('./src/assets/svg/**.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
          },
        },
      })
    )
    .pipe(dest('./app/assets/svg'));
};

/// RESOURCES watchFiles
const resources = () => {
  return src('./src/resources/**').pipe(dest('./app/'));
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
  watch('./src/assets/img/**/*.jpg', imgToApp);
  watch('./src/assets/img/**/*.png', imgToApp);
  watch('./src/assets/img/**/*.jpeg', imgToApp);
  watch('./src/assets/svg/**.svg', svgSprites);
  watch('./src/resources/**', resources);
  watch('./src/assets/fonts/**', fonts);
  watch('./src/assets/fonts/**', fontsStyle);
};

exports.styles = styles;
exports.htmlIncludes = htmlIncludes;
exports.watchFiles = watchFiles;

exports.default = series(
  htmlIncludes,
  fonts,
  fontsStyle,
  styles,
  imgToApp,
  svgSprites,
  resources,
  watchFiles
);

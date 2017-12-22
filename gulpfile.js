const Gulp = require('gulp');
const Plugins = require('gulp-load-plugins')();
const File = require('fs');
const Del = require('del');
const BrowserSync = require('browser-sync').create();
const RunSequence = require('run-sequence');

const PackageJSON = JSON.parse(File.readFileSync('./package-lock.json'));
const AutoPrefixConfig = JSON.parse(File.readFileSync('./autoprefix.json'));
const PackageLibsConfig = JSON.parse(File.readFileSync('./package.json'))['config']['exportFiles'];

let distDir = 'dev';

const BANNER = [
  '/*!',
  ` * Honoka v${PackageJSON.dependencies["bootstrap-honoka"]['version']}`,
  ' * Website http://honokak.osaka/',
  ' * Copyright 2015 windyakin',
  ' * The MIT License',
  ' */',
  '/*!',
  ` * Bootstrap v${PackageJSON.dependencies["bootstrap"]['version']}(http://getbootstrap.com/)`,
  ` * Copyright 2011-${new Date().getFullYear()} Twitter, Inc`,
  ' * Licensed under the MIT license',
  ' */'
].join('\n');

/* ================================
 * Default task
 * ============================== */
Gulp.task('default', () => {
  console.log("Hello, world!");
});

/* ================================
 * Cleanup tasks
 * ============================== */
// clean html
Gulp.task('clean:html', (callback) => {
  return Del(`${distDir}/**/*.html`, callback);
});

// clean libs dir
Gulp.task('clean:assets', (callback) => {
  return Del([`${distDir}/assets/**/*`], callback);
});

// clean libs dir
Gulp.task('clean:lib', (callback) => {
  return Del([`${distDir}/lib/**/*`], callback);
});

// clean dist dir
Gulp.task('clean:dist', (callback) => {
  return Del(['dist/**/*'], callback);
});

/* ================================
 * html build tasks
 * ============================== */
Gulp.task('build:html', () => {
  let siteVariablesJSON = JSON.parse(File.readFileSync('./src/html/variables.json'));
  return Gulp.src(['src/html/**/*.pug', '!src/html/**/_*.pug'], {base: `src/html/`})
    .pipe(Plugins.plumber())
    .pipe(Plugins.pug({ locals: { site: siteVariablesJSON }, pretty: true}))
    .pipe(Gulp.dest(`${distDir}/`));
});

/* ================================
 * Library related tasks
 * ============================== */
// npm libs copy `lib/` directory
Gulp.task('copy:npm', ['clean:lib'], () => {
  let pathes = [];
  for (let key in PackageLibsConfig) {
    PackageLibsConfig[key].forEach((value) => {
      pathes.push(`node_modules/${key}/${value}`);
    });
  }
  return Gulp.src(pathes, {base: 'node_modules'})
    .pipe(Plugins.regexRename(/\/dist\//, "/"))
    .pipe(Gulp.dest(`${distDir}/lib/`));
});

// original libs copy `lib/` directory
Gulp.task('copy:lib', ['clean:lib', 'copy:npm'], () => {
  return Gulp.src(['src/lib/**/*', '!**/.gitkeep'])
    .pipe(Gulp.dest(`${distDir}/lib/`));
});

/* ================================
 * CSS related tasks
 * ============================== */
// linter scss
Gulp.task('lint:scss', () => {
  return Gulp.src(['src/scss/**/*.scss'])
    .pipe(Plugins.sassLint({
      config: 'src/scss/.scss-lint.yml',
    }))
    .on('error', (err) => {
      console.error(err);
    });
});

// compile scss
Gulp.task('build:css', ['lint:scss'], () => {
  let bootstrap = Plugins.filter(['**/bootstrap.**css'], {restore: true});
  return Gulp.src(['src/scss/**/*.scss'])
    // plumber
    .pipe(Plugins.plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    // sass compile
    .pipe(Plugins.sass({
      includePaths: [
        'node_modules/bootstrap-sass/assets/stylesheets/',
        'node_modules/bootstrap-honoka/scss/'
      ],
      sourcemap: 'none',
      lineFeed: 'lf',
      outputStyle: 'expanded'
    }))
    .pipe(Plugins.plumber.stop())
    // autoprefixer
    .pipe(Plugins.postcss([
      require('autoprefixer')({browsers: AutoPrefixConfig})
    ]))
    // add banner
    .pipe(bootstrap)
    .pipe(Plugins.replace(/^@charset "UTF-8";/i, `@charset "UTF-8";\n${BANNER}\n`))
    .pipe(bootstrap.restore)
    .pipe(Gulp.dest(`${distDir}/assets/css/`))
    .pipe(BrowserSync.stream());
});

// optimize css
Gulp.task('opt:css', () => {
  return Gulp.src(['**/*.css', '!**/*.min.css'], {cwd: `${distDir}/assets/css/`})
    .pipe(Plugins.csscomb())
    .pipe(Plugins.postcss([
      require('cssnano')()
    ]))
    .pipe(Gulp.dest(`${distDir}/assets/css/`));
});

/* ================================
 * JavaScript related tasks
 * ============================== */
// linter js
Gulp.task('lint:js', () => {
  return Gulp.src(['src/js/**/*.js'])
    .pipe(Plugins.eslint('./src/js/.eslintrc.json'))
    .pipe(Plugins.eslint.format())
    .pipe(Plugins.eslint.failAfterError());
});

// build js
Gulp.task('build:js', ['lint:js'], () => {
  return Gulp.src(['src/js/**/*.js'])
    .pipe(Gulp.dest(`${distDir}/assets/js/`))
    .pipe(BrowserSync.stream());
});

// optimize js
Gulp.task('opt:js', () => {
  return Gulp.src(['**/*.js', '!**/*.min.js'], {cwd: `${distDir}/assets/js/`})
    .pipe(Plugins.uglify({output: {comments: /^!/}}))
    .pipe(Gulp.dest(`${distDir}/assets/js/`));
});

/* ================================
 * Images related tasks
 * ============================== */
// build image
Gulp.task('build:img', () => {
  return Gulp.src(['src/img/**/*'])
    .pipe(Gulp.dest(`${distDir}/assets/img/`))
    .pipe(BrowserSync.stream());
});

// optimize image
Gulp.task('opt:img', () => {
  return Gulp.src(['**/*.{png,jpg,gif,svg}'], {cwd: `${distDir}/assets/img/`})
    .pipe(Plugins.imagemin())
    .pipe(Gulp.dest(`${distDir}/assets/img/`));
});

/* ================================
 * Watch tasks
 * ============================== */
Gulp.task('watch', () => {
  let message = (ev) => {
    console.log(`File: ${ev.path} was ${ev.type}, running tasks...`);
  };
  Gulp.watch(['src/html/**/*.pug', 'src/html/variables.json'], ['build:html'])
    .on('change', message);
  Gulp.watch(['dev/**/*.html'])
    .on('change', message)
    .on('change', BrowserSync.reload);
  Gulp.watch(['src/scss/**/*.scss'], ['build:css'])
    .on('change', message);
  Gulp.watch(['src/js/**/*.js'], ['build:js'])
    .on('change', message);
  Gulp.watch(['src/img/**/*'], ['build:img'])
    .on('change', message);
  Gulp.watch(['src/lib/**/*'], ['copy:lib'])
    .on('change', message);
});

/* ================================
 * BrowserSync
 * ============================== */
Gulp.task('serve', () => {
  console.log('task browserSync')
  BrowserSync.init({
    server: 'dev/',
    port: 8000
  });
});

/* ================================
 * Other tasks
 * ============================== */
// change output dir
Gulp.task('release', () => {
  distDir = 'dist'
});

/* ================================
 * Mixed tasks
 * ============================== */
Gulp.task('init', ['clean:assets', 'clean:lib']);
Gulp.task('test', ['lint:scss', 'lint:js']);
Gulp.task('lib', ['copy:lib']);
Gulp.task('build', ['build:css', 'build:js', 'build:img', 'build:html']);
Gulp.task('optimize', ['opt:css', 'opt:js', 'opt:img']);
Gulp.task('server', ['serve', 'watch']);

Gulp.task('dev', () => {
  RunSequence(['init'], ['lib'], ['build'], ['serve', 'watch']);
});
Gulp.task('dist', () => {
  RunSequence(['release'], ['clean:dist', 'init'], ['lib'], ['build'], ['optimize']);
});

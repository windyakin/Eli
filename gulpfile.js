'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var fs = require('fs');
var bowerJSON = JSON.parse(fs.readFileSync('./bower.json'));
var del = require('del');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');

var DEST_DIR = 'dev';
var BANNER =	'/*!\n' +
							' * Honoka v' + bowerJSON.devDependencies["Honoka"] + '\n' +
							' * Website http://honokak.osaka/\n' +
							' * Copyright 2015 windyakin\n' +
							' * The MIT License\n' +
							' */\n' +
							'/*!\n' +
							' * Bootstrap v' + bowerJSON.devDependencies["bootstrap-sass"] + ' (http://getbootstrap.com/)\n' +
							' * Copyright 2011-' + new Date().getFullYear() + ' Twitter, Inc\n' +
							' * Licensed under the MIT license\n' +
							' */';
var AUTOPREFIX = [
		'Android 2.3',
		'Android >= 4',
		'Chrome >= 20',
		'Firefox >= 24',
		'Explorer >= 8',
		'iOS >= 6',
		'Opera >= 12',
		'Safari >= 6'
];

/* ================================
 * Default task
 * ============================== */
gulp.task('default', function() {
	console.log("Hello, world!");
});

/* ================================
 * Cleanup tasks
 * ============================== */
// clean bower dir
gulp.task('clean:bower', function(callback) {
	return del(['bower_components/**/*'], callback);
});

// clean libs dir
gulp.task('clean:assets', function(callback) {
	return del([DEST_DIR + '/assets/**/*'], callback);
});

// clean libs dir
gulp.task('clean:lib', function(callback) {
	return del([DEST_DIR + '/lib/**/*'], callback);
});

// clean dist dir
gulp.task('clean:dist', function(callback) {
	return del(['dist/**/*'], callback);
});

/* ================================
 * Library related tasks
 * ============================== */
// bower install
gulp.task('install:bower', ['clean:bower'], function() {
	return plugins.bower();
});

// bower libs copy `lib/` directory
gulp.task('copy:bower', ['install:bower'], function() {
	return gulp.src(['./bower.json'])
		.pipe(plugins.mainBowerFiles({
			includeDev: true
		}))
		.pipe(plugins.regexRename(/\/dist\//, '/'))
		.pipe(gulp.dest(DEST_DIR + '/lib/'));
});

// original libs copy `lib/` directory
gulp.task('copy:lib', ['clean:lib', 'copy:bower'], function() {
	return gulp.src(['src/lib/**/*', '!**/.gitkeep'])
		.pipe(gulp.dest(DEST_DIR + '/lib/'))
});

/* ================================
 * CSS related tasks
 * ============================== */
// linter scss
gulp.task('lint:scss', function() {
	return gulp.src(['src/scss/**/*.scss'])
		.pipe(plugins.sassLint({
			config: 'src/scss/.scss-lint.yml',
		}))
		.on('error', function(err) {
			console.error(err);
		});
});

// compile scss
gulp.task('build:css', ['lint:scss'], function() {
	var bootstrap = plugins.filter(['**/bootstrap.**css'], {restore: true});
	return gulp.src(['src/scss/**/*.scss'])
		// plumber
		.pipe(plugins.plumber({
			errorHandler: function(err) {
				console.log(err.message);
				this.end();
			}
		}))
		// sass compile
		.pipe(plugins.sass({
			includePaths: [
				'bower_components/bootstrap-sass/assets/stylesheets/',
				'bower_components/Honoka/scss/'
			],
			sourcemap: 'none',
			lineFeed: 'lf',
			outputStyle: 'expanded'
		}))
		.pipe(plugins.plumber.stop())
		// autoprefixer
		.pipe(plugins.postcss([
			require('autoprefixer')({browsers: AUTOPREFIX})
		]))
		// add banner
		.pipe(bootstrap)
		.pipe(plugins.replace(/^@charset "UTF-8";/i, '@charset "UTF-8";\n'+ BANNER))
		.pipe(bootstrap.restore)
		.pipe(gulp.dest(DEST_DIR + '/assets/css/'))
		.pipe(browserSync.stream());
});

// optimize css
gulp.task('opt:css', function() {
	return gulp.src(['**/*.css', '!**/*.min.css'], {cwd: DEST_DIR + '/assets/css/'})
		.pipe(plugins.csscomb())
		.pipe(plugins.postcss([
			require('cssnano')()
		]))
		.pipe(gulp.dest('./' + DEST_DIR + '/assets/css/'));
});

/* ================================
 * JavaScript related tasks
 * ============================== */
// linter js
gulp.task('lint:js', function() {
	return gulp.src(['src/js/**/*.js'])
		.pipe(plugins.eslint('./src/js/.eslintrc'))
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
});

// build js
gulp.task('build:js', ['lint:js'], function() {
	return gulp.src(['src/js/**/*.js'])
		.pipe(gulp.dest(DEST_DIR + '/assets/js/'))
		.pipe(browserSync.stream());
});

// optimize js
gulp.task('opt:js', function() {
	return gulp.src(['**/*.js', '!**/*.min.js'], {cwd: DEST_DIR + '/assets/js/'})
		.pipe(plugins.uglify({output: {comments: /^!/}}))
		.pipe(gulp.dest(DEST_DIR + '/assets/js/'));
});

/* ================================
 * Images related tasks
 * ============================== */
// build image
gulp.task('build:img', function() {
	return gulp.src(['src/img/**/*'])
		.pipe(gulp.dest(DEST_DIR + '/assets/img/'))
		.pipe(browserSync.stream());
});

// optimize image
gulp.task('opt:img', function() {
	return gulp.src(['**/*.{png,jpg,gif,svg}'], {cwd: DEST_DIR + '/assets/img/'})
		.pipe(plugins.imagemin())
		.pipe(gulp.dest(DEST_DIR + '/assets/img/'));
});

/* ================================
 * Watch tasks
 * ============================== */
gulp.task('watch', function() {
	var message = function(ev) {
		console.log('File: ' + ev.path + ' was ' + ev.type + ', running tasks...');
	};
	gulp.watch(['src/scss/**/*.scss'], ['build:css'])
		.on('change', message);
	gulp.watch(['src/js/**/*.js'], ['build:js'])
		.on('change', message);
	gulp.watch(['src/img/**/*'], ['build:img'])
		.on('change', message);
	gulp.watch(['src/lib/**/*'], ['copy:lib'])
		.on('change', message);
});

/* ================================
 * BrowserSync
 * ============================== */
gulp.task('serve', function() {
	browserSync = browserSync.create();
	console.log('task browserSync')
	browserSync.init({
		server: 'dev/',
		port: 8000
	});
});

/* ================================
 * Other tasks
 * ============================== */
// change output dir
gulp.task('release', function() {
	DEST_DIR = 'dist'
});

// copy to dist/ from dev/
gulp.task('copy:dist', function() {
	gulp.src(['**/*', '!assets/**/*', '!lib/**/*'], {cwd: 'dev/'})
		.pipe(gulp.dest('dist/'));
});

/* ================================
 * Mixed tasks
 * ============================== */
gulp.task('init', ['clean:bower', 'clean:assets', 'clean:lib']);
gulp.task('test', ['lint:scss', 'lint:js']);
gulp.task('lib', ['install:bower', 'copy:bower', 'copy:lib']);
gulp.task('build', ['build:css', 'build:js', 'build:img']);
gulp.task('optimize', ['opt:css', 'opt:js', 'opt:img']);
gulp.task('server', ['serve', 'watch']);

gulp.task('dev', function() {
	runSequence(['init'], ['lib'], ['build'], ['serve', 'watch']);
});
gulp.task('dist', function() {
	runSequence(['release'], ['clean:dist', 'init'], ['lib'], ['build', 'copy:dist'], ['optimize']);
});


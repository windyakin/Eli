'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var fs = require('fs');
var bowerJSON = JSON.parse(fs.readFileSync('./bower.json'));

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

gulp.task('default', function() {
	console.log("Hello, world!");
});

// bower install
gulp.task('bower-install', function() {
	return plugins.bower();
});

// bower libs copy `lib/` directory
gulp.task('bower-dest', ['bower-install'], function() {
	return gulp.src(['./bower.json'])
		.pipe(plugins.mainBowerFiles({
			includeDev: true
		}))
		.pipe(plugins.regexRename(/\/dist\//, '/'))
		.pipe(gulp.dest('./'+ DEST_DIR +'/lib'));
});

// linter scss
gulp.task('lint-scss', function() {
	return gulp.src(['src/scss/**/*.scss'])
		.pipe(plugins.scssLint({
			config: 'src/scss/.scss-lint.yml',
			bundleExec: true
		}))
		.on('error', function(err) {
			console.error(err);
		});
});

// compile scss
gulp.task('build-css', ['lint-scss'], function() {
	var bootstrap = plugins.filter(['**/bootstrap.**css'], {restore: true});
	return gulp.src(['src/scss/**/*.scss'])
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
		// autoprefixer
		.pipe(plugins.postcss([
			require('autoprefixer')({browsers: [
				'Android 2.3',
				'Android >= 4',
				'Chrome >= 20',
				'Firefox >= 24',
				'Explorer >= 8',
				'iOS >= 6',
				'Opera >= 12',
				'Safari >= 6'
			]})
		]))
		// add banner
		.pipe(bootstrap)
		.pipe(plugins.replace(/^@charset "UTF-8";/i, '@charset "UTF-8";\n'+ BANNER))
		.pipe(bootstrap.restore)
		.pipe(gulp.dest('./' + DEST_DIR + '/assets/css/'));
});

// optimize css
gulp.task('opt-css', ['build-css'], function() {
	return gulp.src(['**/*.css', '!**/*.min.css'], {cwd: './' + DEST_DIR + '/assets/'})
		.pipe(plugins.csscomb())
		.pipe(plugins.postcss([
			require('cssnano')()
		]))
		.pipe(gulp.dest('./' + DEST_DIR + '/assets/css/'));
});

// linter js
gulp.task('lint-js', function() {
	return gulp.src(['src/js/**/*.js'])
		.pipe(plugins.eslint('./src/js/.eslintrc'))
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
});

// build js
gulp.task('build-js', ['lint-js'], function() {
	return gulp.src(['src/js/**/*.js'])
		.pipe(gulp.dest('./' + DEST_DIR + '/assets/js/'));
});

// optimize js
gulp.task('opt-js', ['build-js'], function() {
	return gulp.src(['**/*.js', '!**/*.min.js'], {cwd: './' + DEST_DIR + '/assets/js/'})
		.pipe(plugins.uglify({
			options: {
				compsress: {
					warnings: false
				},
				mangle: true,
				preserveComments: 'some'
			}
		}))
		.pipe(gulp.dest('./' + DEST_DIR + '/assets/js/'));
});

// build image
gulp.task('build-img', function() {
	return gulp.src(['src/img/**/*'])
		.pipe(gulp.dest('./' + DEST_DIR + '/assets/img/'));
});

// optimize image
gulp.task('opt-img', ['build-img'], function() {
	return gulp.src(['**/*.{png,jpg,gif,svg}'], {cwd: './' + DEST_DIR + '/assets/img/'})
		.pipe(plugins.imagemin())
		.pipe(gulp.dest('./' + DEST_DIR + '/assets/img/'));
});

gulp.task('release', function() {
	DEST_DIR = 'dist'
});

// mixed tasks
gulp.task('bower', ['bower-install', 'bower-dest']);

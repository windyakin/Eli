'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var DEST_DIR = 'dev/'

gulp.task('default', function() {
	console.log("Hello, world!");
});

// bower install
gulp.task('bower-install', function() {
	return plugins.bower();
});

// bower libs copy `lib/` directory
gulp.task('bower-dest', ['bower-install'], function() {
	return gulp.src('./bower.json')
		.pipe(plugins.mainBowerFiles({
			includeDev: true
		}))
		.pipe(plugins.regexRename(/\/dist\//, '/'))
		.pipe(gulp.dest('./'+ DEST_DIR +'lib'));
});

gulp.task('release', function() {
	DEST_DIR = 'dist/'
});

// mixed tasks
gulp.task('bower', ['bower-install', 'bower-dest']);

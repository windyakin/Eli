'use strict';

module.exports = function(grunt) {

	var pkg, bower, taskName;

	pkg = grunt.file.readJSON('package.json');
	bower = grunt.file.readJSON('bower.json');

	grunt.initConfig({
		// 出力フォルダ(デフォルトは dev/ 以下)
		dir: 'dev',
		bowerJSON: bower,
		// バナー
		banner:	'/*!\n' +
						' * Honoka v<%= bowerJSON.devDependencies["Honoka"] %>\n' +
						' * Website http://honokak.osaka/\n' +
						' * Copyright 2015 windyakin\n' +
						' * The MIT License\n' +
						' */\n' +
						'/*!\n' +
						' * Bootstrap v<%= bowerJSON.devDependencies["bootstrap-sass"] %> (http://getbootstrap.com/)\n' +
						' * Copyright 2011-<%= grunt.template.today("yyyy") %> Twitter, Inc\n' +
						' * Licensed under the MIT license\n' +
						' */\n',
		// bannerの調整
		replace: {
			// バナーの追加
			banner: {
				src: ['<%= dir %>/assets/css/bootstrap**.css'],
				dest: '<%= dir %>/assets/css/',
				replacements: [
					{
						from: '@charset "UTF-8";',
						to: '@charset "UTF-8";\n<%= banner %>'
					}
				]
			}
		},
		// Bowerでインストールしたライブラリの配置
		bower: {
			lib: {
				options: {
					targetDir: '<%= dir %>/lib/',
					layout: function(dir, component, source) {
						return component + '/' + dir;
					}
				}
			}
		},
		// SCSSのビルド
		sass: {
			options: {
				sourcemap: 'none',
				linefeed: 'lf',
				outputStyle: 'expanded',
				includePaths: [
					'bower_components/bootstrap-sass/assets/stylesheets/',
					'bower_components/Honoka/scss/'
				]
			},
			assets: {
				files: [{
					expand: true,
					cwd: 'src/scss/',
					src: '**/*.scss',
					dest: '<%= dir %>/assets/css/',
					ext: '.css'
				}]
			}
		},
		// SCSSのLinter
		scsslint: {
			options: {
				bundleExec: true,
				config: 'src/scss/.scss-lint.yml',
				reporterOutput: null,
				colorizeOutput: true
			},
			assets: ['src/scss/*.scss']
		},
		// ベンダープレフィックス
		postcss: {
			autoprefixer: {
				options: {
					map: false,
					processors: [
						require('autoprefixer')({
							browsers: [
								'Android 2.3',
								'Android >= 4',
								'Chrome >= 20',
								'Firefox >= 24',
								'Explorer >= 8',
								'iOS >= 6',
								'Opera >= 12',
								'Safari >= 6'
							]
						})
					]
				},
				expand: true,
				cwd: '<%= dir %>/assets/css/',
				src: ['**/*.css'],
				dest: '<%= dir %>/assets/css/',
				ext: '.css'
			}
		},
		// CSSのプロパティソート
		csscomb: {
			options: {
				config: 'src/scss/.csscomb.json'
			},
			assets: {
				expand: true,
				cwd: '<%= dir %>/assets/css/',
				src: ['**/*.css'],
				dest: '<%= dir %>/assets/css/',
				ext: '.css'
			}
		},
		// CSSのminify
		cssmin: {
			options: {
				compatibility: 'ie9',
				keepSpecialComments: '*',
				noAdvanced: true
			},
			assets: {
				files: [
					{
						expand: true,
						cwd: '<%= dir %>/assets/css/',
						src: ['**/*.css', '!**/*.min.css'],
						dest: '<%= dir %>/assets/css/',
						ext: '.css'
					}
				]
			}
		},
		// JavaScript構文チェック (eslint)
		eslint: {
			assets: ['src/js/*.js']
		},
		// JavaScriptのminify
		uglify: {
			options: {
				compress: {
					warnings: false
				},
				mangle: true,
				preserveComments: 'some'
			},
			assets: {
				files: [
					{
						expand: true,
						cwd: '<%= dir %>/assets/js',
						src: ['**/*.js', '!**/*.min.js'],
						dest: '<%= dir %>/assets/js/',
						ext: '.js'
					}
				]
			}
		},
		// 画像最適化
		image: {
			assets: {
				files: [{
					expand: true,
					cwd: '<%= dir %>/assets/img/',
					src: ['**/*.{png,jpg,gif,svg}'],
					dest: '<%= dir %>/assets/img/'
				}]
			}
		},
		copy: {
			js: {
				expand: true,
				cwd: 'src/js/',
				src: ['**/*'],
				dest: '<%= dir %>/assets/js/'
			},
			img: {
				expand: true,
				cwd: 'src/img/',
				src: ['**/*'],
				dest: '<%= dir %>/assets/img/'
			},
			lib: {
				expand: true,
				cwd: 'src/lib/',
				src: ['**/*', '!**/.gitkeep'],
				dest: '<%= dir %>/lib/'
			},
			dist: {
				expand: true,
				cwd: 'dev/',
				src: ['**/*', '!assets/**/*', '!lib/**/*'],
				dest: 'dist/'
			}
		},
		// Clean
		clean: {
			bower: {
				src: ['bower_components/**/*']
			},
			assets: {
				src: ['<%= dir %>/assets/**/*']
			},
			lib: {
				src: ['<%= dir %>/lib/**/*']
			},
			dist: {
				src: ['dist/**/*']
			}
		},
		// watch task
		watch: {
			scss: {
				files: ['src/scss/**/*.scss'],
				tasks: ['scsslint:assets', 'build-css']
			},
			js: {
				files: ['src/js/**/*.js'],
				tasks: ['eslint:assets', 'build-js']
			},
			img: {
				files: ['src/img/**/*.{png,jpg,gif,svg}'],
				tasks: ['build-img']
			},
			lib: {
				files: ['src/lib/**/*'],
				tasks: ['copy:lib']
			},
			configFiles: {
				files: [
					'Gruntfile.js',
					'package.json',
					'src/scss/.csscomb.json',
					'src/scss/.scss-lint.yml',
					'src/js/.eslintrc'
				],
				options: {
					reload: true
				}
			}
		},
		// 簡易サーバ
		browserSync: {
			dev: {
				bsFiles: {
					src: ['dev/**/*']
				},
				options: {
					watchTask: true,
					server: 'dev/',
					port: 8000
				}
			}
		}
	});

	for (taskName in pkg.devDependencies) {
		if (taskName.substring(0, 6) === 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}

	// 出力フォルダをdistに切り替えるタスク
	// まったく同じタスクを dev/ と dist/ で書く手間がなくなる
	grunt.task.registerTask('release', 'Switch distribution mode', function() {
		var dir = this.args[0] || 'dist';
		grunt.config.merge({
			dir: dir
		});
		grunt.log.ok('Set distribution mode. Output dir is "' + dir + '/"');
	});

	grunt.registerTask('default', []);

	// Inital
	grunt.registerTask('init', ['clean:bower', 'clean:assets', 'clean:lib']);

	// Test Task
	grunt.registerTask('test', ['scsslint:assets', 'eslint:assets']);

	// Library Install
	grunt.registerTask('lib', ['bower:lib', 'copy:lib']);

	// Optimize Task
	grunt.registerTask('opt-assets', ['csscomb:assets', 'cssmin:assets', 'uglify:assets', 'image:assets']);

	// Build
	// CSS
	grunt.registerTask('build-css', ['sass:assets', 'postcss:autoprefixer', 'replace:banner']);
	// JavaScript
	grunt.registerTask('build-js', ['copy:js']);
	// Image
	grunt.registerTask('build-img', ['copy:img']);
	// Bundle Build Task
	grunt.registerTask('build', ['build-css', 'build-js', 'build-img']);

	// Develop
	grunt.registerTask('dev', ['init', 'lib', 'build', 'browserSync:dev', 'watch']);

	// Release
	grunt.registerTask('dist', ['release', 'init', 'test', 'lib', 'build', 'opt-assets', 'copy:dist']);


	grunt.registerTask('eatwarnings', function() {
		grunt.warn = grunt.fail.warn = function(warning) {
			grunt.log.error(warning);
		};
	});

};

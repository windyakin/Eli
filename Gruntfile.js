'use strict';

module.exports = function(grunt) {
	var pkg, taskName;
	pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		// 文字列の置き換え
		replace: {
			// bannerの調整
			banner: {
				src: ['dist/assets/css/**/*.css'],
				overwrite: true,
				replacements: [
					{
						from: '@charset "UTF-8";/*!',
						to: '@charset "UTF-8";\n/*!'
					},
					{
						from: 'The MIT License\n */',
						to: 'The MIT License\n */\n'
					}
				]
			}
		},
		clean: {
			dev: {
				src: ['dev/assets/css', 'dev/assets/js', 'dev/assets/img']
			},
			dist: {
				src: ['dist/']
			}
		},
		// cssのminify
		cssmin: {
			dist: {
				expand: true,
				cwd: 'dev/assets/css/',
				src: ['**/*.css'],
				dest: 'dist/assets/css/',
				options: {
					noAdvanced: true
				}
			}
		},
		image: {
			dist: {
				files: [{
					expand: true,
					cwd: 'src/img',
					src: ['**/*.{png,jpg,gif,svg}'],
					dest: 'dist/assets/img'
				}]
			}
		},
		// JavaScript難読化
		uglify: {
			dist: {
				files: [{
					expand: true,
					cwd: 'src/js',
					src: ['**/*.js', '!**/*.min.js'],
					dest: 'dist/assets/js'
				}]
			}
		},
		// compassのコンパイル
		compass: {
			dev: {
				options: {
					sassDir: 'src/css',
					config: 'config.rb'
				}
			}
		},
		copy: {
			// Bootstrap関連ファイルのコピー
			bootstrap: {
				files: [
					{
						expand: true,
						cwd: "src/bootstrap/assets/javascripts/",
						src: ["bootstrap.min.js"],
						dest: "dev/assets/js"
					}
				]
			},
			// 開発中のコピー
			devjs: {
				files: [
					{
						expand: true,
						cwd: 'src/js/',
						src: ['**/*.js'],
						dest: 'dev/assets/js'
					}
				]
			},
			// 開発中のコピー
			devimg: {
				files: [
					{
						expand: true,
						cwd: 'src/img/',
						src: ['**/*'],
						dest: 'dev/assets/img'
					}
				]
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: 'dev/',
						src: ['**/*'],
						dest: 'dist'
					}
				]
			}
		},
		// ファイル更新監視
		watch: {
			// compassの自動コンパイル
			compass: {
				files: ['src/css/**/*.scss'],
				tasks: ['compass:dev'],
			},
			// JavaScriptのコピー
			devjs: {
				files: ['src/js/**/*.js'],
				tasks: ['copy:devjs'],
			},
			// JavaScriptのコピー
			devimg: {
				files: ['src/img/**/*'],
				tasks: ['copy:devimg'],
			}
		},
		// 簡易サーバ
		browserSync: {
			dev: {
				bsFiles: {
					src: ["dev/**/*"]
				},
				options: {
					watchTask: true,
					server: 'dev',
					port: 8000
				}
			}
		},
		// テストサーバ
		connect: {
			server: {
				options: {
					port: 8000,
					hostname: '*',
					base: 'dev'
				}
			}
		}
	});

	// GruntFile.jsに記載されているパッケージを自動読み込み
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == 'grunt-') {
			grunt.loadNpmTasks(taskName);
		}
	}

	// 開発用
	grunt.registerTask('initdev', ['clean:dev', 'copy:bootstrap', 'compass:dev', 'copy:devjs', 'copy:devimg']);
	grunt.registerTask('server', ['initdev', 'browserSync:dev', 'watch']);

	// ビルド
	grunt.registerTask('build', ['clean:dist', 'initdev', 'copy:dist', 'uglify:dist', 'cssmin:dist', 'replace:banner', 'image:dist'])

	grunt.registerTask('eatwarnings', function() {
		grunt.warn = grunt.fail.warn = function(warning) {
			grunt.log.error(warning);
		};
	});

};

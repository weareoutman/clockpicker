var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css'),
	rename = require('gulp-rename');

var paths = {
	js: ['src/*.js'],
	css: ['src/*.css']
};

gulp.task('js', function() {
	gulp.src(paths.js)
		.pipe(gulp.dest('dist'))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
	gulp.src(paths.css)
		.pipe(gulp.dest('dist'))
		.pipe(minifyCSS({
			keepSpecialComments: 1
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
	gulp.watch(paths.js, ['js']);
	gulp.watch(paths.css, ['css']);
});

gulp.task('default', ['js', 'css', 'watch']);

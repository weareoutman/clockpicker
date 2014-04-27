var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	qunit = require('gulp-qunit'),
	replace = require('gulp-replace'),
	// Replace package.version
	version = require('./package').version,
	versionRegExp = /\{package\.version\}/;

// Rename and uglify scripts
function js(prefix) {
	gulp.src('src/clockpicker.js')
		.pipe(rename({
			prefix: prefix + '-'
		}))
		.pipe(replace(versionRegExp, version))
		.pipe(gulp.dest('dist'))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist'));
}

// Rename, concat and minify stylesheets
function css(prefix) {
	var stream;
	if (prefix === 'bootstrap') {
		stream = gulp.src('src/clockpicker.css');
	} else {
		// Concat with some styles picked from bootstrap
		stream = gulp.src(['src/standalone.css', 'src/clockpicker.css'])
			.pipe(concat('clockpicker.css'));
	}
	stream.pipe(rename({
			prefix: prefix + '-'
		}))
		.pipe(replace(versionRegExp, version))
		.pipe(gulp.dest('dist'))
		.pipe(minifyCSS({
			keepSpecialComments: 1
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist'));
}

gulp.task('js', function() {
	js('bootstrap');
	js('jquery');
});

gulp.task('css', function() {
	css('bootstrap');
	css('jquery');
});

gulp.task('watch', function() {
	gulp.watch('src/*.js', ['js']);
	gulp.watch('src/*.css', ['css']);
});

gulp.task('test', function() {
    return gulp.src('test/*.html')
        .pipe(qunit());
});

gulp.task('default', ['js', 'css', 'watch']);

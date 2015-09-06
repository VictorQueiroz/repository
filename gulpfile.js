var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var wrapper = require('gulp-wrapper');

gulp.task('build', function () {
	var commentHeader = '';

	gulp.src('src/**/*.js')
	.pipe(concat('repository.js'))
	.pipe(wrapper({
		header: '(function () {',
		footer: '}());'
	}))
	.pipe(uglify())
	.pipe(wrapper({
		header: commentHeader
	}))
	.pipe(gulp.dest('dist'));
});
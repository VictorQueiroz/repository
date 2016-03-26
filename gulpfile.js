var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var wrapper = require('gulp-wrapper');

gulp.task('build', function () {
	var commentHeader = '';

	gulp.src([
		'src/util.js',
	  'src/events.js',
	  'src/Repository.js',
	  
	  // query
	  'src/query/QueryFilter.js',
	  'src/query/QueryBuilder.js',
	  'src/query/*.js',

	  'src/context/ContextEventEmitter.js',
	  'src/context/Context.js',
	  'src/context/ContextQueryBuilder.js',
	  'src/context/*.js',

	  'src/*.js',
	])
	.pipe(concat('repository.js'))
	.pipe(wrapper({
		header: '(function () { "use strict"; ',
		footer: '}.call(this));'
	}))
	.pipe(gulp.dest('dist'))
	.pipe(uglify())
	.pipe(concat('repository.min.js'))
	.pipe(gulp.dest('dist'));
});
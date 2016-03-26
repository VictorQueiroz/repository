// Karma configuration
// Generated on Thu Sep 03 2015 00:11:25 GMT-0300 (BRT)

module.exports = function(config) {
  config.set({

	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: '',


	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['jasmine'],


	// list of files / patterns to load in the browser
	files: [
		'test/util.js',
		
		'bower_components/q/q.js',
		'bower_components/lodash/lodash.js',
		'bower_components/es5-shim/es5-shim.min.js',

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
		'test/mock-data-provider.js',
	  
	  'integration/**/*.js',
	  'test/**/*.js',

	  '!src/repository.js'
	],


	// list of files to exclude
	exclude: [
	],


	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {
	},


	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['progress'],


	// web server port
	port: 9876,


	// enable / disable colors in the output (reporters and logs)
	colors: true,


	// level of logging
	// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
	logLevel: config.LOG_INFO,


	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: true,


	// start these browsers
	// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
	browsers: ['PhantomJS'],


	// Continuous Integration mode
	// if true, Karma captures browsers, runs the tests and exits
	singleRun: false
  })
}

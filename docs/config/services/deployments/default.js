module.exports = function defaultDeployment () {
	return {
		name: 'default',
		examples: {
      commonFiles: {
        scripts: [
          '../../lib/Faker/build/build/faker.min.js',
          '../../lib/jquery/dist/jquery.min.js',
          '../../lib/lodash/lodash.min.js',
          '../../lib/angular/angular.min.js',
        ]
      },
      dependencyPath: '../../../'
    },
		stylesheets: [
			'css/app.css'
		]
	};
};
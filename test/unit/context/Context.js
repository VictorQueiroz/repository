describe('RepositoryContext', function () {
	var instance, context;

	beforeEach(function () {
		var config = new RepositoryConfig({
			dataProvider: new DefaultDataProvider(),
			name: 'Default'
		});

		instance = new Repository(config);

		context = instance.createContext('test-context');
	});

	xit('should emit update when the query updates');

	it('should give access to pagination', function () {
		context.update();

		var pagination = context.pagination();
		expect(pagination.first).toBeDefined();

		context.reset();
	});
});
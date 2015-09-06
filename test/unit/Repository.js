describe('repository', function () {
	var repository;

	beforeEach(module('integration'));

	beforeEach(inject(function (BasicDataProvider) {
		var config = new RepositoryConfig({
			name: 'User',
			dataProvider: BasicDataProvider
		});
		
		repository = new Repository(config);
	}));

	it('should create a context', function () {
		var context = repository.createContext('user-list');

		context.setData({
			data: {}
		});

		expect(context.data).toEqual({});
	});

	xit('should listen to any created context "update" event');

	it('should remove a context', function () {
		var context = repository.createContext('context-1');
	});

	it('should return a created context that was created before with the given name', function () {
		var context = repository.createContext('user-list-3');

		expect(context instanceof Context).toBeTruthy();
	});

	it('should modify context data', function () {
		var context = repository.createContext('user-list-2');

		context.setData({
			data: {}
		});

		var data = context.getData();

		data.name = 'John Constantine';
		data.age = 33;

		expect(context.getData().name).toEqual('John Constantine');
	});
});
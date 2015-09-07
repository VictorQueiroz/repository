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

	var $httpBackend;

	beforeEach(inject(function (_$httpBackend_) {
		$httpBackend = _$httpBackend_;
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should create a context', function () {
		var context = repository.createContext('user-list');

		context.setData({
			data: {}
		});

		expect(context.data).toEqual({});
	});

	it('should remove a context', function () {
		var context = repository.createContext('context-1');

		context = repository.removeContext(context.name).getContext(context.name);

		expect(context).not.toBeDefined();
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

	it('should retrieve a resource', function () {
		$httpBackend.expectGET('/api/users/1').respond(200, {
			name: 'Clementine'
		});

		repository.findOne(1).then(function (user) {
			expect(user.name).toBe('Clementine');
		});

		$httpBackend.flush();
	});

	it('should retrieve resources', function () {
		$httpBackend.expectGET('/api/users?page=1&per_page=3').respond([
			{name: 'user 1'},
			{name: 'user 2'},
			{name: 'user 3'}
		]);

		var qb = new QueryBuilder();

		qb.from(repository.name)
		.limit(3);

		repository.find(qb).then(function (users) {
			expect(users.length).toBe(3);
			expect(users[0].name).toBe('user 1');
		});

		$httpBackend.flush();
	});

	it('should remove resources', function() {
		$httpBackend.whenGET('/api/users?page=1&per_page=4').respond(200, {
			data: [
				{id: 1, name: 'user 1'},
				{id: 1, name: 'user 2'},
				{id: 1, name: 'user 3'}
			]
		});

		var context = repository.createContext('user-target-1');
		
		context.update();

		$httpBackend.flush();

		$httpBackend.expectDELETE('/api/users/1').respond(200);
		$httpBackend.expectDELETE('/api/users/1').respond(200);
		$httpBackend.expectDELETE('/api/users/1').respond(200);

		var ids = context.data.map(function (user) {
			return user.id;
		});

		repository.remove(ids);

		$httpBackend.flush();
	});

	it('should remove resource', function () {
		$httpBackend.whenGET('/api/users/1').respond({
			name: 'Walter White',
			id: 1
		});

		$httpBackend.expectDELETE('/api/users/1').respond(200);

		repository.findOne(1).then(function (user) {
			return repository.removeOne(user.id);
		});

		$httpBackend.flush();
	});

  it('should save a resource', function () {
    $httpBackend.whenPOST('/api/users', {
      name: 'Jessie Pinkman'
    })
    .respond(200);

    repository.saveOne({
      name: 'Jessie Pinkman'
    });

    $httpBackend.flush();
  });

  it('should save resources', function () {
    $httpBackend.whenPOST('/api/users', {
      name: 'foo'
    })
    .respond(200);

    repository.save([
      {name: 'foo'},
      {name: 'foo'}
    ]);

    $httpBackend.flush();
  });
});

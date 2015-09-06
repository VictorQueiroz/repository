describe('QueryFilter', function () {
	var instance;

	beforeEach(function () {
		instance = new QueryFilter();
	});

	it('should create an instance and add filters to it', function () {
		var nameFilter = {
			name: 'name',
			value: 'Carlos',
			operator: QueryBuilder.EQ
		};

		var filters = QueryFilter.create([nameFilter]);

		expect(filters.toJSON()).toEqual([nameFilter]);
	});

	it('should add filter', function () {
		instance.where('age', QueryBuilder.GTE, 18);

		expect(instance.toJSON()).toEqual([{
			name: 'age', operator: QueryBuilder.GTE, value: 18
		}]);

		instance.remove('age');
	});

	it('should remove a filter', function () {
		instance.where('mother.name', 'MMM');

		expect(instance._filters.length).toBe(1);

		instance.remove('mother.name');

		expect(instance._filters.length).toBeFalsy();
	});

	it('should reset filters', function () {
		instance.where('age', QueryBuilder.GTE, 18);
		instance.where('size', QueryBuilder.GTE, 60);

		expect(instance._filters.length).toBe(2);

		instance.reset();

		expect(instance._filters.length).toBeFalsy();
	});
});
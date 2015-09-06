describe('QueryBuilder', function () {
	var qb;

	beforeEach(function () {
		qb = new QueryBuilder();
	});

	it('should return an instance of QueryBuilder', function () {
		expect(qb instanceof QueryBuilder).toBeTruthy();
	});

	it('should add a filtering rule', function () {
		qb.where('name', QueryBuilder.EQ, 'July');

		qb.reset();
	});

	it('should set items per page pagination property', function () {
		qb.limit(4);

		expect(qb.pagination().itemsPerPage).toBe(4);

		qb.reset();
	});

	it('should reset the whole query builder', function () {
		qb.where('name', 'John');
		qb.where('music', 'Blues');

		expect(qb._filter._filters.length).toBe(2);

		qb.reset();

		expect(qb._filter._filters.length).toBeFalsy();
	});
});
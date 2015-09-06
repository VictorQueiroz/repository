describe('QueryPagination', function () {
	var pagination;

	beforeEach(function () {
		pagination = new QueryPagination();
	});

	it('should have total items property', function () {
		expect(pagination.totalItems).toEqual(0);
	});

	it('should update the pagination instance', function () {
		pagination.setState({
			itemsPerPage: 4,
			totalItems: 100
		});

		expect(pagination.itemsPerPage).toEqual(4);
		expect(pagination.totalItems).toEqual(100);

		pagination.reset();
	});

	it('should automatically set items per page, total pages and current page property', function () {
		pagination.setState({
			totalItems: 100
		});

		expect(pagination.totalPages).toBe(25);
		expect(pagination.defaults.currentPage).toBe(pagination.currentPage);
		expect(pagination.defaults.itemsPerPage).toBe(pagination.itemsPerPage);
	});

	it('should not go foward when has no pages', function () {
		expect(pagination.totalPages).toEqual(0);

		pagination.next();

		expect(pagination.currentPage).toEqual(1);
		
		pagination.reset();
	});

	it('should go forward', function () {
		var totalItems = 40;
		var totalPages = totalItems / pagination.itemsPerPage;

		pagination.setState({
			totalItems: totalItems
		});

		expect(pagination.currentPage).toBe(1);

		for(var i=1; i<pagination.totalPages - 1; i++) {
			pagination.next();

			expect(pagination.currentPage).toBe(i + 1);
			expect(pagination.totalItems).toBe(totalItems);
			expect(pagination.totalPages).toBe(totalPages);
		}
		
		pagination.reset();
	});

	it('should go to previous page', function () {
		pagination.setState({
			totalItems: 10
		});

		pagination.next();

		expect(pagination.currentPage).toBe(2);

		pagination.previous();

		expect(pagination.currentPage).toBe(1);

		pagination.reset();
	});

	it('should not previous page if it is the last page', function () {
		pagination.setState({
			totalItems: 12,
			itemsPerPage: 3
		});

		expect(pagination.itemsPerPage).toBe(3);
		expect(pagination.currentPage).toBe(1);

		pagination.previous();

		expect(pagination.currentPage).toBe(1);

		pagination.reset();
	});

	it('should go to the last page', function (){
		pagination.setState({
			totalItems: 10,
			itemsPerPage: 5
		});

		pagination.last();

		expect(pagination.currentPage).toEqual(pagination.totalPages);

		pagination.reset();
	});

	it('should go to the first page', function (){
		pagination.setState({
			totalItems: 10,
			itemsPerPage: 5
		});

		pagination.first();

		expect(pagination.currentPage).toEqual(1);

		pagination.reset();
	});

	it('should converts all fields in number', function () {
		pagination.setState({
			totalItems: '10',
			itemsPerPage: '4'
		});

		expect(pagination.currentPage).toBe(1);
		expect(pagination.itemsPerPage).toBe(4);
	});
});
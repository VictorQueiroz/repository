describe('UserRepository: Repository in practice', function () {
	var UserRepository, $httpBackend, $rootScope, $controller, $timeout;

	beforeEach(module('integration'));

	beforeEach(inject(function (_$timeout_, _UserRepository_, _$httpBackend_, _$rootScope_, _$controller_) {
		UserRepository = _UserRepository_;
		$httpBackend = _$httpBackend_;
		$controller = _$controller_;
		$rootScope = _$rootScope_;
		$timeout = _$timeout_;
	}));

	beforeEach(inject(function ($filter) {
		var matcher = /\/api\/users\?(.*)/;
		var limitTo = $filter('limitTo');
		
		$httpBackend.whenGET(matcher).respond(function (method, url) {
			var params = parseQueryString(url);

			var data = [
				{ name: 'Victor' },
				{ name: 'Darlan' },
				{ name: 'Trevor' },
				{ name: 'Michael' },
				{ name: 'Franklin' },
				{ name: 'Jessie' },
				{ name: 'Walter' },
				{ name: 'Skyler' },
				{ name: 'Dexter' },
				{ name: 'Gregory' },
				{ name: 'Hank' },
				{ name: 'Junior' }
			];

			var totalItems = data.length;
			var currentPage = parseInt(params.page) || 1;
			
			var limit = Math.floor(parseInt(params.per_page)) || 2;
			var begin = (currentPage - 1) * limit;

			var totalPages = totalItems / limit;

			var meta = {
				currentPage: currentPage,
				totalItems: totalItems,
				itemsPerPage: limit
			};

			return [200, {
				data: limitTo(data, limit, begin),
				meta: meta
			}];
		});
	}));

	afterEach(function() {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it('should create context inside controller and append it to $scope', function () {
		var scope = $rootScope.$new();
		var UserListCtrl = $controller('UserListCtrl as userCtrl', {
			$scope: scope
		});

		scope.users.update();

		$httpBackend.flush();

		expect(scope.users.data.length).toBe(4);
		expect(scope.users.data[0].name).toBe('Victor');

		scope.users.pagination().next();

		$httpBackend.flush();

		expect(scope.users.data[0].name).toBe('Franklin');
	});
});
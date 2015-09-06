angular.module('integration', ['ngMock'])
.factory('BasicDataProvider', function ($http) {
	function BasicDataProvider () {
		DataProvider.call(this);
	}

	util.inherits(BasicDataProvider, DataProvider, {
		getResourceURI: function (id) {
			return '/api/' + String(id).toLowerCase() + 's';
		},

		find: function (id, params) {
			var query = {};

			var pagination = params.pagination;

			if(pagination) {
				query.per_page = pagination.itemsPerPage;
				query.page = pagination.currentPage;
			}

			var options = {
				params: query
			};

			return $http.get(this.getResourceURI(id), options).then(function (res) {
				return res.data;
			});
		}
	});

	return new BasicDataProvider();
})
.factory('UserRepository', function (BasicDataProvider) {
	return new Repository(new RepositoryConfig({
		dataProvider: BasicDataProvider,
		name: 'User'
	}));
})
.controller('UserListCtrl', function (UserRepository, $scope) {
	var context = UserRepository.createContext('user-list');

	$scope.users = context;
});
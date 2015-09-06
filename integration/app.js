angular.module('integration', ['ngMock'])
.factory('BasicDataProvider', function ($http, $q) {
	function BasicDataProvider () {
		DataProvider.call(this);
	}

	util.inherits(BasicDataProvider, DataProvider, {
		getResourceURI: function (resourceName, id) {
			return '/api/' + String(resourceName).toLowerCase() + 's' + (angular.isDefined(id) ? '/' + id : '');
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
		},

		findOne: function (resourceName, id) {
			return $http.get(this.getResourceURI(resourceName, id)).then(function (res) {
				return res.data;
			});
		},

		save: function (resourceName, entities ){
			var self = this;
			var promises = entities.map(function (entity) {
				return self.saveOne(resourceName, entity);
			});

			return $q.all(promises);
		},

		saveOne: function (resourceName, entity) {
			var URI = this.getResourceURI(resourceName, entity.id);
			var method = 'post';

			if(entity.id) {
				method = 'put';
			}

			return $http[method](URI, entity).then(function (res) {
				return res.data;
			});
		},

		removeOne: function (resourceName, id) {
			var URI = this.getResourceURI(resourceName, id);

			return $http.delete(URI);
		},

		remove: function (resourceName, ids) {
			var self = this;
			var promises = ids.map(function (id) {
				return self.removeOne(resourceName, id);
			});

			return $q.all(promises);
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
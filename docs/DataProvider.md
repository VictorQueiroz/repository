## DataProvider

The service which deal with the data provided by the `QueryBuilder` and the resource name to make the request and provide the data

**REMEMBER:** The Repository and all the other components are completely abstract from all these methods logic.

### Methods

#### DataProvider#find
Perform a search of many resources, partially you do not need to use that alone. If you want to keep the data, you must use a `Context`. Example:
```js
.controller('UserCtrl', function (UserRepository) {
	$scope.users = UserRepository.createContext('user-list');

	/**
	 * This method will perform a `find` and update not only
	 * this, but all the other contexts with the new data
	 */
	$scope.users.update();
});
```
This way, you can access the `$scope.users.data` from your view and everytime you change the context query, the `Repository` will automatically update your context data.

--

The `DataProvider#find` response object must be the following. When performing a `find`
```js
{
	data: {Array|Object},
	meta: {Object}
}
```

The `meta` field is *optional* and will take care of the pagination. The `meta` object must be exactly equal to the `QueryPagination` prototype properties.

- `currentPage`
- `totalItems`
- `totalPages`
- `itemsPerPage`

The `totalPages` and `currentPage` properties are completely optional.

### Example
```js
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
```

### Usage

#### JavaScript
```js
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
```

#### HTML
```html
<div ng-init="users.update()">
	<div ng-repeat="user in users.data">
		{{user.name}}
	</div>

	<a ng-click="users.pagination().next()">Next</a>
	<a ng-click="users.pagination().previous()">Previous</a>
</div>
```
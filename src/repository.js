angular.module('repository', [])
.factory('Repository', function () {
	return Repository;
})
.factory('DataProvider', function () {
	return DataProvider;
})
.factory('RepositoryConfig', function () {
	return RepositoryConfig;
})

// QueryBuilder
.factory('QueryBuilder', function () {
	return QueryBuilder;
})
.factory('QueryFilter', function() {
	return QueryFilter;
})
.factory('QueryPagination', function () {
	return QueryPagination;
})
.factory('QuerySorting', function () {
	return QuerySorting;
})

.factory('Context', function () {
	return Context;
})
.factory('ContextQueryBuilder', function () {
	return ContextQueryBuilder;
})

.factory('util', function () {
	return util;
})
.factory('EventEmitter', function () {
	return EventEmitter;
});
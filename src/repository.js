window.repository = {
	Repository: Repository,
	DataProvider: DataProvider,
	RepositoryConfig: RepositoryConfig,
	QueryBuilder: QueryBuilder,
	QueryFilter: QueryFilter,
	QueryPagination: QueryPagination,
	QuerySorting: QuerySorting,
	Context: Context,
	ContextQueryBuilder: ContextQueryBuilder,
	ContextEventEmitter: ContextEventEmitter,
	util: util,
	EventEmitter: EventEmitter
};

angular.module('repository', [])
.value('Repository', Repository)
.value('DataProvider', DataProvider)
.value('RepositoryConfig', RepositoryConfig)

// QueryBuilder
.value('QueryBuilder', QueryBuilder)
.value('QueryFilter', QueryFilter)
.value('QueryPagination', QueryPagination)
.value('QuerySorting', QuerySorting)

.value('Context', Context)
.value('ContextQueryBuilder', ContextQueryBuilder)
.value('ContextEventEmitter', ContextEventEmitter)

.value('util', util)
.value('EventEmitter', EventEmitter);
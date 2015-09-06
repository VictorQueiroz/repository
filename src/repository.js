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

window.EventEmitter = EventEmitter;
/**
 * @name ContextQueryBuilder
 * @description
 * This class inherit the `QueryBuilder` and it's a quick shot
 * to listen the update events emitted from `QueryFilter`, `QuerySorting`,
 * `QueryPagination` and propagates it to the query builder
 * instance.
 */
function ContextQueryBuilder () {
	QueryBuilder.call(this);

	function onUpdateFn () {
		this.emit('update');
	}

	var updateFn = onUpdateFn.bind(this);

	// the QueryBuilder instance won't trigger itself the events,
	// this is a context-only thing so we proxy the events here
	this._filter.on('update', updateFn);
	this._sorting.on('update', updateFn);
	this._pagination.on('update', updateFn);
}

util.inherits(ContextQueryBuilder, QueryBuilder);
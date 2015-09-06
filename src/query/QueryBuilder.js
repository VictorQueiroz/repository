function QueryBuilder (resourceName) {
	EventEmitter.call(this);

	this._filter = new QueryFilter();
	this._sorting = new QuerySorting();
	this._pagination = new QueryPagination();

	this.resourceName = resourceName || null;
}

util.inherits(QueryBuilder, EventEmitter, {
	from: function (resourceName) {
		this.resourceName = resourceName;

		return this;
	},

	where: function () {
		this._filter.where.apply(this._filter, arguments);

		return this;
	},

	orderBy: function () {
		this._sorting.sort.apply(this._sorting, arguments);

		return this;
	},

	pagination: function () {
		return this._pagination;
	},

	limit: function (limit) {
		this.pagination().setState({
			itemsPerPage: limit
		});

		return this;
	},

	toJSON: function () {
		return {
			filters: this._filter.toJSON(),
			pagination: this._pagination.toJSON(),
			sorting: this._sorting.toJSON()
		};
	},

	reset: function () {
		this._filter.reset();
		this._sorting.reset();
		this._pagination.reset();

		return this;
	}
});

util.extend(QueryBuilder, QueryFilter.prototype.operators);
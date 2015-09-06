/**
 * @name Context
 * @kind function
 * @description
 * The context must be updated by the
 * Repository
 */
function Context(name) {
	EventEmitter.call(this);

	var query = Context.createQuery();

	this.name = name;
	this.data = null;
	this.error = null;
	this.query = query;

	/**
	 * When the query get updated
	 * the context must emit an updated
	 * event from the inside
	 */
	query.on('update', function (context) {
		this.emit('update');
	}.bind(this));

	return this;
}

Context.createQuery = function () {
	return new ContextQueryBuilder();
};

util.inherits(Context, EventEmitter, {
	INVALID_RESPONSE: 'INVALID_RESPONSE',

	getData: function () {
		return this.data;
	},

	setData: function (dataTransferObject) {
		if(util.isUndefined(dataTransferObject) || !util.isObject(dataTransferObject)) {
			this.setError(this.INVALID_RESPONSE);

			return this;
		}

		var page = dataTransferObject.meta;

		if(page) {
			var pagination = this.query.pagination();

			pagination.setState({
				totalItems: page.totalItems,
				currentPage: page.currentPage,
				itemsPerPage: page.itemsPerPage
			});
		}

		this.data = dataTransferObject.data || null;
		this.error = null;
		
		return this;
	},

	/**
	 * @name Context#createQuery
	 * @description
	 * It's a wrapper to:
	 * ```
	 * Context.createQuery().from(this.name);
	 * ```
	 */
	createQuery: function () {
		return Context.createQuery().from(this.name);
	},

	/**
	 * @name Context#pagination
	 * @description
	 * Retrieve the `QueryBuilder` pagination
	 */
	pagination: function () {
		return this.query.pagination();
	},

	reset: function () {
		this.query.reset();

		return this;
	},

	update: function () {
		this.triggerUpdate(this);

		return this;
	},

	triggerUpdate: function () {
		return this.emit('update');
	},

	setError: function (reason) {
	},

	/**
	 * @name Context#toJSON
	 * @description
	 * This method is only a wrapper to `this.query.toJSON()`
	 */
	toJSON: function () {
		return this.query.toJSON();
	}
});
function Repository (config) {
	EventEmitter.call(this);

	if(config instanceof RepositoryConfig === false) {
		throw new Error('Invalid config');
	}

	if(!config.dataProvider) {
		throw new Error('You must specify a data provider');
	}

	this.contexts = {};
	this.config = config;
	this.dataProvider = this.config.dataProvider;
	this.name = this.config.name;
}

util.inherits(Repository, EventEmitter, {
	hasContext: function (name) {
		return this.contexts[name] instanceof Context;
	},

	createContext: function (name) {
		if(!this.hasContext(name)) {
			var context = new Context(name);

			// using updateContext.bind to generate a handler is harder to test
			// keep calling with the closure's "self" reference
			context.on('update', function () {
				this.updateContext(context);
			}.bind(this));

			this.contexts[name] = context;
		}

		return this.getContext(name);
	},

	getContext: function (name) {
		return this.contexts[name];
	},

	updateContext: function (context) {
		var state = context.toJSON();

		this.dataProvider.find(this.name, state).then(function (data) {
			context.setData(data);
		}, function (err) {
			context.setError(err);
		});

		return this;
	},

	/**
	 * @name Repository#find
	 * @description
	 * Find many resources using the `DataProvider`
	 */
	find: function (queryBuilder) {
		if(queryBuilder instanceof QueryBuilder === false) {
			throw new Error('Invalid query builder');
		}

		var params = queryBuilder.toJSON();

		return this.dataProvider.find(this.name, params);
	}
});
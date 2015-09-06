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

	removeContext: function (name) {
		delete this.contexts[name];

		return this;
	},

	find: function (queryBuilder) {
		if(queryBuilder instanceof QueryBuilder === false) {
			throw new Error('Invalid query builder');
		}

		var params = queryBuilder.toJSON();

		return this.dataProvider.find(this.name, params);
	},

	findOne: function (id) {
		return this.dataProvider.findOne(this.name, id);
	},

	removeOne: function (id) {
		return this.dataProvider.removeOne(this.name, id);
	},

	remove: function (ids) {
		return this.dataProvider.remove(this.name, ids);
	},

	saveOne: function (entity) {
		return this.dataProvider.save(this.name, entity).then(function (response) {
			self.emit(self.EVENTS.UPDATE);

			return response;
		});
	},

	save: function (entities) {
		if(entities.length === 0) {
			return this.dataProvider.error(this.ERRORS.EMPTY_ENTITY_SET);
		}

		var self = this;

		return this.dataProvider.save(this.name, entities).then(function (response) {
			self.emit(self.EVENTS.UPDATE);

			return response;
		});
	},

	EVENTS: {
		UPDATE: 'update'
	},

	ERRORS: {
		EMPTY_ENTITY_SET: 'EMPTY_ENTITY_SET',
		INVALID_ENTITY_SET: 'INVALID_ENTITY_SET'
	}
});
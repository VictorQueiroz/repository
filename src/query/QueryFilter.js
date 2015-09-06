function QueryFilter() {
	EventEmitter.call(this);

	this._filters = [];

	this.operatorsArray = Object.keys(this.operators).map(function(key) {
		return this.operators[key];
	}, this);
}

QueryFilter.create = function (filters) {
	var instance = new QueryFilter();

	instance.setState(filters);

	return instance;
};

util.inherits(QueryFilter, EventEmitter, {
	reset: function () {
		this._filters = [];
	},

	where: function (name, operator, value) {
		if(arguments.length === 2) {
			value = operator;
			operator = this.operators.EQ;
		}

		if(!this.hasOperator(operator)) {
			return this;
		}

		this.addFilter(name, operator, value);

		return this;
	},

	hasOperator: function (operator) {
		return this.operatorsArray.indexOf(operator) > -1;
	},

	remove: function (name) {
		if(!name) {
			return this;
		}
		this._filters.forEach(function (filter, index) {
			if(filter.name === name) {
				this._filters.splice(index, 1);
			}
		}, this);

		return this;
	},

	addFilter: function () {
		var filter;
		var args = util.toArray(arguments);

		if(util.isArray(args[0])) {
			args = args[0];
		}

		if(util.isObject(args[0])) {
			filter = args[0];
		}

		if(util.isUndefined(filter)) {
			filter = {
				name: args[0],
				operator: args[1],
				value: args[2]
			};
		}

		if(!filter) {
			return this;
		}
		
		var hasDuplicated = this._filters.some(function (current) {
			return current.name === filter.name && current.operator === filter.operator;
		});

		// prevent duplicated filters
		if(hasDuplicated) {
			return this;
		}

		this._filters.push(filter);

		return this;
	},

	addFilters: function (filters) {
		if(!util.isArray(filters)) {
			throw new Error('Must be an array');
		}

		filters.forEach(this.addFilter, this);

		return this;
	},

	operators: {
		EQ: '=',
		LT: '<',
		LTE: '<=',
		GT: '>',
		GTE: '>=',
		IN: 'in',
		ST: '^',
		END: '$',
		LK: '~'
	},

	setState: function () {
		return this.addFilter.apply(this, arguments);
	},

	toJSON: function () {
		return this._filters.slice();
	}
});
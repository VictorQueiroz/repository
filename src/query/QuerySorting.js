function QuerySorting () {
	EventEmitter.call(this);

	this._sorting = [];
}

util.inherits(QuerySorting, EventEmitter, {
	directions: {
		ASC: 'asc',
		DESC: 'desc'
	},

	sort: function (name, direction) {
		if(arguments.length === 1) {
			direction = this.directions.ASC;
		}

		var sorting = {
			name: name,
			direction: direction
		};

		this.addSorting(sorting);

		return this;
	},

	hasSorting: function (sortingName) {
		return this._sorting.some(function (sorting) {
			return sorting.name === sortingName;
		});
	},

	addSorting: function (sorting) {
		if(this.hasSorting(sorting.name)) {
			this._sorting.push(sorting);
		}

		return this;
	},

	reset: function () {
		this._sorting = [];

		return this;
	},

	toJSON: function () {
		return this._sorting.slice();
	}
});
function QueryPagination () {
	EventEmitter.call(this);

	this.reset();
}

util.inherits(QueryPagination, EventEmitter, {
	isValidPage: function (page) {
		return page > 0 && page <= this.totalPages;
	},

	next: function () {
		if(!this.isValidPage(this.currentPage + 1)) {
			return this;
		}

		this.setPage(this.currentPage + 1);

		return this;
	},

	previous: function () {
		if(!this.isValidPage(this.currentPage - 1)) {
			return this;
		}

		this.setPage(this.currentPage - 1);

		return this;
	},

	setPage: function (page) {
		var oldPage = this.currentPage;

		this.currentPage = page;

		this.emit('update');

		return this;
	},

	setItemsPerPage: function (itemsPerPage) {
		this.setState({ itemsPerPage: itemsPerPage });
		this.refresh();

		return this;
	},

	setState: function (config) {
		var totalItems = config.totalItems;

		if(!(totalItems === 0) && !util.isUndefined(totalItems) && isNaN(totalItems)) {
			throw new Error('Invalid total items property');
		}

		repository.extend(this, config);

		this.refresh();

		return this;
	},

	refresh: function () {
		if(this.currentPage < 1 || !this.isValidPage(this.currentPage)) {
			this.currentPage = this.defaults.currentPage;
		}
		
		if(this.itemsPerPage < 1) {
			this.itemsPerPage = Math.floor(this.defaults.itemsPerPage);
		}

		this.totalItems = this.totalItems || 0;
		this.itemsPerPage = parseInt(this.itemsPerPage);
		
		this.totalPages = this.totalItems / this.itemsPerPage;

		if(!this.totalPages || util.isFloat(this.totalPages)) {
			this.totalPages = Math.round(this.totalItems / this.itemsPerPage);
		}

		this._pages = [];

		for(var i=0; i<this.totalPages; i++) {
			this._pages.push(i + 1);
		}
	},

	reset: function () {
		this.setState({
			currentPage: 0,
			itemsPerPage: 0,
			totalItems: 0,
			totalPages: 0
		});

		return this;
	},

	last: function () {
		if(!this.isValidPage(this.totalPages)) {
			return this;
		}

		this.setPage(this.totalPages);

		return this;
	},

	first: function () {
		if(!this.currentPage) {
			return this;
		}

		return this.setPage(1);
	},

	toJSON: function() {
		var state = {};
		var keys = ['itemsPerPage', 'currentPage', 'count'];

		repository.forEach(keys, function (key) {
			if(repository.isDefined(this[key])) {
				state[key] = this[key];
			}
		}, this);

		return state;
	},

	defaults: {
		itemsPerPage: 4,
		currentPage: 1,
		totalItems: 0
	}
});
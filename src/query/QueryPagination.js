function QueryPagination () {
	EventEmitter.call(this);

	this.on('update', function () {
	});

	this.on('pageChanged', function (page, oldPage) {
		if(page === 1) {
			this.emit('pageFirst');
		}

		if(page > oldPage) {
			this.emit('pageNext');
		} else if (page < oldPage) {
			this.emit('pagePrevious');
		}

		if(page === this.totalPages) {
			this.emit('pageLast');
		}
	});

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

		this.emit('pageChanged', page, oldPage);
		this.emit('update');

		return this;
	},

	setState: function (config) {
		var totalItems = config.totalItems;

		if(!(totalItems === 0) && !util.isUndefined(totalItems) && isNaN(totalItems)) {
			throw new Error('Invalid total items property');
		}

		angular.extend(this, config);

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
		this.totalPages = Math.round(this.totalItems / this.itemsPerPage);

		this.totalPagesArray = [];

		for(var i=0; i<this.totalPages.length; i++) {
			this.totalPagesArray.push(i + 1);
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

		angular.forEach(keys, function (key) {
			if(angular.isDefined(this[key])) {
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
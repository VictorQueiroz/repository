function DataProvider () {
	EventEmitter.call(this);
}

util.inherits(DataProvider, EventEmitter, {
	find: util.missing('find'),

	findOne: util.missing('find')
});
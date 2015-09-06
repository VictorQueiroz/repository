/**
 * @name DataProvider
 * @description
 * The service which deal with the data provided
 * by the `QueryBuilder` and the resource name to
 * make the request and provide the data
 *
 * **REMEMBER:** The Repository and all the other components are completely
 * abstract from all these methods logic.
 */
function DataProvider () {
	EventEmitter.call(this);
}

util.inherits(DataProvider, EventEmitter, {
	find: util.missing('find'),

	findOne: util.missing('find')
});
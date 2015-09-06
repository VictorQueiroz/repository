function DefaultDataProvider () {
	DataProvider.call(this);

	this.fakeData = [];

	for(var i=0; i<10; i++) {
		this.fakeData.push(i);
	}
}

util.inherits(DefaultDataProvider, DataProvider, {
	find: function () {
		var data = this.fakeData;

		return Q.Promise(function (resolve, reject) {
			resolve({data: data});
		});
	},

	findOne: function () {
		var data = this.fakeData;
		
		return Q.Promise(function (resolve) {
			resolve(_.first(data));
		});
	}
});
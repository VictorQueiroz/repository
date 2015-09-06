function ContextEventEmitter () {
	EventEmitter.call(this);

	this._pauseEvents = false;
	this._queue = [];
}

util.inherits(ContextEventEmitter, EventEmitter, {
	pause: function () {
		this._pauseEvents = true;

		return this;
	},

	resume: function () {
		this._pauseEvents = false;
		this.finish();

		return this;
	},

	isPaused: function () {
		return this._pauseEvents;
	},

	schedule: function () {
		var args = util.toArray(arguments);

		this._queue.push(args);

		return this;
	},

	finish: function () {
		this._queue.forEach(function (args, index) {
			this.emit.apply(this, args);
		}, this);

		this._queue.splice(0, this._queue.length);

		return this;
	},

	emit: function () {
		if(this.isPaused()) {
			return this.schedule.apply(this, arguments);
		}

		return EventEmitter.prototype.emit.apply(this, arguments);
	}
});
describe('ContextEventEmitter', function () {
	var em;

	beforeEach(function () {
		em = new ContextEventEmitter();
	});

	it('should pause events', function () {
		var spy = jasmine.createSpy();

		em.on('event1', spy);

		expect(spy).not.toHaveBeenCalled();

		em.pause();
		em.emit('event1');

		expect(spy).not.toHaveBeenCalled();

		em.resume();
	});

	it('should resume events and it should execute queued past events', function () {
		var emitted = false;
		em.on('event2', function (value) {
			emitted = value || !emitted;
		});

		expect(emitted).toBeFalsy();

		em.emit('event2');

		expect(emitted).toBeTruthy();

		em.pause();

		em.emit('event2', 100);

		expect(emitted).toBe(true);

		em.resume();

		expect(emitted).toBe(100);

		em.resume();
	});

	it('should not keep delete the events when resume after run all the queued events', function () {
		var times = 0;

		em.on('event3', function () {
			times++;
		});

		em.pause();

		em.emit('event3');
		em.emit('event3');
		em.emit('event3');
		em.emit('event3');
		em.emit('event3');

		em._queue.forEach(function (args) {
			expect(args[0]).toBe('event3');
		});

		expect(em._queue.length).toBe(5);

		em.resume();

		expect(em._queue.length).toBe(0);
		expect(times).toBe(5);
	});
});
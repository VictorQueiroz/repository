function parseQueryString(string) {
	var pairs = string.split('?').slice(1).join('').split('&'),
		result = {};

	pairs.forEach(function(pair) {
		var name = pair.slice(0, pair.indexOf('=')),
			value = pair.slice(name.length + 1);

		result[name] = decodeURIComponent(value);
	});

	return result;
}
(function () { "use strict"; // Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var util = {};
var process = {
  noDeprecation: true,
  env: {
    NODE_DEBUG: 1
  }
};
var global = {
  process: process
};

util.isFloat = function (n){
  return n === Number(n) && n % 1 !== 0;
};

util.missing = function (method) {
  return function () {
    throw new Error('Method ' + method + ' not implemented');
  };
};

util.toArray = function (value) {
  return Array.prototype.slice.apply(value);
};

var formatRegExp = /%[sdj%]/g;
util.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
util.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return util.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
util.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = util.format.apply(util, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    util._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
util.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'symbol': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== util.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // This could be a boxed primitive (new String(), etc.), check valueOf()
  // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
  // a number which, when object has some additional user-stored `keys`,
  // will be printed out.
  var formatted;
  var raw = value;
  try {
    // the .valueOf() call can fail for a multitude of reasons
    if (!isDate(value))
      raw = value.valueOf();
  } catch (e) {
    // ignore...
  }

  if (isString(raw)) {
    // for boxed Strings, we have to remove the 0-n indexed entries,
    // since they just noisey up the output and are redundant
    keys = keys.filter(function(key) {
      return !(key >= 0 && key < raw.length);
    });
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
    // now check the `raw` value to handle boxed primitives
    if (isString(raw)) {
      formatted = formatPrimitiveNoColor(ctx, raw);
      return ctx.stylize('[String: ' + formatted + ']', 'string');
    }
    if (isNumber(raw)) {
      formatted = formatPrimitiveNoColor(ctx, raw);
      return ctx.stylize('[Number: ' + formatted + ']', 'number');
    }
    if (isBoolean(raw)) {
      formatted = formatPrimitiveNoColor(ctx, raw);
      return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  // Make boxed primitive Strings look like such
  if (isString(raw)) {
    formatted = formatPrimitiveNoColor(ctx, raw);
    base = ' ' + '[String: ' + formatted + ']';
  }

  // Make boxed primitive Numbers look like such
  if (isNumber(raw)) {
    formatted = formatPrimitiveNoColor(ctx, raw);
    base = ' ' + '[Number: ' + formatted + ']';
  }

  // Make boxed primitive Booleans look like such
  if (isBoolean(raw)) {
    formatted = formatPrimitiveNoColor(ctx, raw);
    base = ' ' + '[Boolean: ' + formatted + ']';
  }

  if (keys.length === 0 && (!array || value.length === 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) {
    // Format -0 as '-0'. Strict equality won't distinguish 0 from -0,
    // so instead we use the fact that 1 / -0 < 0 whereas 1 / 0 > 0 .
    if (value === 0 && 1 / value < 0)
      return ctx.stylize('-0', 'number');
    return ctx.stylize('' + value, 'number');
  }
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
  // es6 symbol primitive
  if (isSymbol(value))
    return ctx.stylize(value.toString(), 'symbol');
}


function formatPrimitiveNoColor(ctx, value) {
  var stylize = ctx.stylize;
  ctx.stylize = stylizeNoColor;
  var str = formatPrimitive(ctx, value);
  ctx.stylize = stylize;
  return str;
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'")
                 .replace(/\\\\/g, '\\');
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var length = output.reduce(function(prev, cur) {
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
var isArray = util.isArray = Array.isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
util.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
util.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
util.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
util.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
util.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
util.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
util.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
util.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
util.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
util.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
util.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
util.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
util.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg instanceof Buffer;
}
util.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
util.log = function() {
  console.log('%s - %s', timestamp(), util.format.apply(util, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
util.inherits = function(ctor, superCtor, attributes) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if(isObject(attributes)) {
    util.extend(ctor.prototype, attributes);
  }
};

util._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

util.extend = util._extend;

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}


// Deprecated old stuff.

util.p = util.deprecate(function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    console.error(util.inspect(arguments[i]));
  }
}, 'util.p: Use console.error() instead');


util.print = util.deprecate(function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(String(arguments[i]));
  }
}, 'util.print: Use console.log instead');


util.puts = util.deprecate(function() {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stdout.write(arguments[i] + '\n');
  }
}, 'util.puts: Use console.log instead');


util.debug = util.deprecate(function(x) {
  process.stderr.write('DEBUG: ' + x + '\n');
}, 'util.debug: Use console.error instead');


util.error = util.deprecate(function(x) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    process.stderr.write(arguments[i] + '\n');
  }
}, 'util.error: Use console.error instead');


util.pump = util.deprecate(function(readStream, writeStream, callback) {
  var callbackCalled = false;

  function call(a, b, c) {
    if (callback && !callbackCalled) {
      callback(a, b, c);
      callbackCalled = true;
    }
  }

  readStream.addListener('data', function(chunk) {
    if (writeStream.write(chunk) === false) readStream.pause();
  });

  writeStream.addListener('drain', function() {
    readStream.resume();
  });

  readStream.addListener('end', function() {
    writeStream.end();
  });

  readStream.addListener('close', function() {
    call();
  });

  readStream.addListener('error', function(err) {
    writeStream.end();
    call(err);
  });

  writeStream.addListener('error', function(err) {
    readStream.destroy();
    call(err);
  });
}, 'util.pump(): Use readableStream.pipe() instead');


var uv;
util._errnoException = function(err, syscall, original) {
  if (isUndefined(uv)) uv = process.binding('uv');
  var errname = uv.errname(err);
  var message = syscall + ' ' + errname;
  if (original)
    message += ' ' + original;
  var e = new Error(message);
  e.code = errname;
  e.errno = errname;
  e.syscall = syscall;
  return e;
};
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function EventEmitter() {
  EventEmitter.init.call(this);
}

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;

  if (!this._events || this._events === Object.getPrototypeOf(this)._events)
    this._events = {};

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (!util.isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error' && !this._events.error) {
    er = arguments[1];
    if (this.domain) {
      if (!er)
        er = new Error('Uncaught, unspecified "error" event.');
      er.domainEmitter = this;
      er.domain = this.domain;
      er.domainThrown = false;
      this.domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      throw Error('Uncaught, unspecified "error" event.');
    }
    return false;
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (this.domain && this !== process)
    this.domain.enter();

  if (util.isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (util.isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  if (this.domain && this !== process)
    this.domain.exit();

  return true;
};

EventEmitter.prototype.addListener = function addListener(type, listener) {
  var m;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              util.isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (util.isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (util.isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!util.isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d %s listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length, type);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function once(type, listener) {
  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
  var list, position, length, i;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (util.isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (util.isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (util.isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (Array.isArray(listeners)) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function listeners(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (util.isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (util.isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};
function Repository (config) {
	EventEmitter.call(this);

	if(config instanceof RepositoryConfig === false) {
		throw new Error('Invalid config');
	}

	if(!config.dataProvider) {
		throw new Error('You must specify a data provider');
	}

	this.contexts = {};
	this.config = config;
	this.dataProvider = this.config.dataProvider;
	this.name = this.config.name;
}

util.inherits(Repository, EventEmitter, {
	hasContext: function (name) {
		return this.contexts[name] instanceof Context;
	},

	createContext: function (name) {
		if(!this.hasContext(name)) {
			var context = new Context(name);

			// using updateContext.bind to generate a handler is harder to test
			// keep calling with the closure's "self" reference
			context.on('update', function () {
				this.updateContext(context);
			}.bind(this));

			this.contexts[name] = context;
		}

		return this.getContext(name);
	},

	getContext: function (name) {
		return this.contexts[name];
	},

	updateContext: function (context) {
		var state = context.toJSON();

		this.dataProvider.find(this.name, state).then(function (data) {
			context.setData(data);
		}, function (err) {
			context.setError(err);
		});

		return this;
	},

	removeContext: function (name) {
		delete this.contexts[name];

		return this;
	},

	find: function (queryBuilder) {
		if(queryBuilder instanceof QueryBuilder === false) {
			throw new Error('Invalid query builder');
		}

		var params = queryBuilder.toJSON();

		return this.dataProvider.find(this.name, params);
	},

	findOne: function (id) {
		return this.dataProvider.findOne(this.name, id);
	},

	removeOne: function (id) {
		return this.dataProvider.removeOne(this.name, id);
	},

	remove: function (ids) {
		return this.dataProvider.remove(this.name, ids);
	},

	saveOne: function (entity) {
    var self = this;

		return this.dataProvider.saveOne(this.name, entity).then(function (response) {
			self.emit(self.EVENTS.UPDATE);

			return response;
		});
	},

	save: function (entities) {
		if(entities.length === 0) {
			return this.dataProvider.error(this.ERRORS.EMPTY_ENTITY_SET);
		}

		var self = this;

		return this.dataProvider.save(this.name, entities).then(function (response) {
			self.emit(self.EVENTS.UPDATE);

			return response;
		});
	},

	EVENTS: {
		UPDATE: 'update'
	},

	ERRORS: {
		EMPTY_ENTITY_SET: 'EMPTY_ENTITY_SET',
		INVALID_ENTITY_SET: 'INVALID_ENTITY_SET'
	}
});

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
function QueryBuilder (resourceName) {
	EventEmitter.call(this);

	this._filter = new QueryFilter();
	this._sorting = new QuerySorting();
	this._pagination = new QueryPagination();

	this.resourceName = resourceName || null;
}

util.inherits(QueryBuilder, EventEmitter, {
	from: function (resourceName) {
		this.resourceName = resourceName;

		return this;
	},

	where: function () {
		this._filter.where.apply(this._filter, arguments);

		return this;
	},

	orderBy: function () {
		this._sorting.sort.apply(this._sorting, arguments);

		return this;
	},

	pagination: function () {
		return this._pagination;
	},

	limit: function (limit) {
		this.pagination().setState({
			itemsPerPage: limit
		});

		return this;
	},

	toJSON: function () {
		return {
			filters: this._filter.toJSON(),
			pagination: this._pagination.toJSON(),
			sorting: this._sorting.toJSON()
		};
	},

	reset: function () {
		this._filter.reset();
		this._sorting.reset();
		this._pagination.reset();

		return this;
	}
});

util.extend(QueryBuilder, QueryFilter.prototype.operators);
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
		if(!this.hasSorting(sorting.name)) {
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
/**
 * @ngdoc object
 * @name Context
 * @kind function
 * @description
 * 
 * 
 */
function Context(name) {
	EventEmitter.call(this);

	var query = this.createQuery();

	this.name = name;
	this.data = null;
	this.error = null;
	this.query = query;

	/**
	 * When the query get updated
	 * the context must emit an updated
	 * event from the inside
	 */
	query.on('update', function (context) {
		this.emit('update');
	}.bind(this));

	return this;
}

Context.createQuery = function () {
	return new ContextQueryBuilder();
};

util.inherits(Context, ContextEventEmitter, {
	INVALID_RESPONSE: 'INVALID_RESPONSE',

	getData: function () {
		return this.data;
	},

	setData: function (dataTransferObject) {
		if(util.isUndefined(dataTransferObject) || !util.isObject(dataTransferObject)) {
			this.setError(this.INVALID_RESPONSE);

			return this;
		}

		var page = dataTransferObject.meta;

		if(page) {
			var pagination = this.query.pagination();

			pagination.setState({
				totalItems: page.totalItems,
				currentPage: page.currentPage,
				itemsPerPage: page.itemsPerPage
			});
		}

		this.data = dataTransferObject.data || null;
		this.error = null;
		
		return this;
	},

	/**
	 * @name Context#createQuery
	 * @description
	 * It's a wrapper to:
	 * ```
	 * Context.createQuery().from(this.name);
	 * ```
	 */
	createQuery: function () {
		return Context.createQuery().from(this.name);
	},

	/**
	 * @name Context#pagination
	 * @description
	 * Retrieve the `QueryBuilder` pagination
	 */
	pagination: function () {
		return this.query.pagination();
	},

	reset: function () {
		this.query.reset();

		return this;
	},

	update: function () {
		this.triggerUpdate(this);

		return this;
	},

	triggerUpdate: function () {
		return this.emit('update');
	},

	setError: function (reason) {
	},

	/**
	 * @name Context#toJSON
	 * @description
	 * This method is only a wrapper to `this.query.toJSON()`
	 */
	toJSON: function () {
		return this.query.toJSON();
	}
});
function ContextQueryBuilder () {
	QueryBuilder.call(this);

	function onUpdateFn () {
		this.emit('update');
	}

	var updateFn = onUpdateFn.bind(this);

	// the QueryBuilder instance won't trigger itself the events,
	// this is a context-only thing so we proxy the events here
	this._filter.on('update', updateFn);
	this._sorting.on('update', updateFn);
	this._pagination.on('update', updateFn);
}

util.inherits(ContextQueryBuilder, QueryBuilder, {

});
function DataProvider () {
	EventEmitter.call(this);
}

util.inherits(DataProvider, EventEmitter, {
	find: util.missing('find'),

	findOne: util.missing('find')
});
function RepositoryConfig (config) {
	if(!config.name) {
		throw new Error('Invalid resource name');
	}

	if(config.dataProvider instanceof DataProvider === false) {
		throw new Error('Invalid data provider');
	}

	util.extend(this, config);
}
var hasOwnProperty = Object.prototype.hasOwnProperty,
    getPrototypeOf = Object.getPrototypeOf;

function isBlankObject(value) {
  return value !== null && typeof value === 'object' && !getPrototypeOf(value);
}

function forEach(obj, iterator, context) {
  var key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        // Need to check if hasOwnProperty exists,
        // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
        if (key !== 'prototype' && key !== 'length' && key !== 'name' &&
          (!obj.hasOwnProperty || obj.hasOwnProperty(key))
        ) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (isArray(obj) || isArrayLike(obj)) {
      var isPrimitive = typeof obj !== 'object';
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context, obj);
    } else if (isBlankObject(obj)) {
      // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
      for (key in obj) {
        iterator.call(context, obj[key], key, obj);
      }
    } else if (typeof obj.hasOwnProperty === 'function') {
      // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else {
      // Slow path for objects which do not have a method `hasOwnProperty`
      for (key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }
  return obj;
}

function toArray(toTransformEntity) {
  var i,
      transformedArray = [];
  for(i = 0; i < toTransformEntity.length; i++) {
    transformedArray[i] = toTransformEntity[i];
  }
  return transformedArray;
}

function isDefined(value) {
  return value !== 'undefined';
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function extend (target) {
  if(typeof target === 'undefined') target = {};

  var sources = toArray(arguments).slice(1).filter(isDefined);

  var source,
      value,
      keys,
      key,
      ii = sources.length,
      jj,
      i,
      j;

  for(i = 0; i < ii; i++) {
    if((source = sources[i]) && isObject(source)) {
      keys = Object.keys(source);
      jj = keys.length;

      for(j = 0; j < jj; j++) {
        key           = keys[j];
        value         = source[key];

        target[key]   = value;
      }
    }
  }

  return target;
}

var repository = {
  Repository: Repository,
  DataProvider: DataProvider,
  RepositoryConfig: RepositoryConfig,
  QueryBuilder: QueryBuilder,
  QueryFilter: QueryFilter,
  QueryPagination: QueryPagination,
  QuerySorting: QuerySorting,
  Context: Context,
  ContextQueryBuilder: ContextQueryBuilder,
  ContextEventEmitter: ContextEventEmitter,
  util: util,
  EventEmitter: EventEmitter,
  isDefined: isDefined,
  forEach: forEach,
  extend: extend
};

// Uses AMD or browser globals to create a module. This example creates a
// global even when AMD is used. This is useful if you have some scripts
// that are loaded by an AMD loader, but they still want access to globals.
// If you do not need to export a global for the AMD case, see amdWeb.js.

// If you want something that will also work in Node, and still export a
// global in the AMD case, see returnExportsGlobal.js
// If you want to support other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrictGlobal.js

// Defines a module "amdWebGlobal" that depends another module called "b".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
   // AMD. Register as an anonymous module.
   define(['repository'], function (repository) {
    // Also create a global in case some scripts
    // that are loaded still are looking for
    // a global even when an AMD loader is in use.
    return (root.amdWebGlobal = factory(repository));
   });
  } else {
    // Browser globals
    factory(root);
  }
}(this, function (root) {
  //use b in some fashion.

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  root.repository = repository;
}));}.call(this));
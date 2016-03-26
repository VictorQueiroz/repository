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
}));
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _backend = __webpack_require__(1);

	var _bridge = __webpack_require__(23);

	var _bridge2 = _interopRequireDefault(_bridge);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// this is injected into the app when the panel is activated

	window.addEventListener("message", handshake);

	function handshake(e) {
	  if (e.data.source === "apollo-devtools-proxy" && e.data.payload === "init") {
	    window.removeEventListener("message", handshake);

	    var listeners = [];
	    var bridge = new _bridge2.default({
	      listen: function listen(fn) {
	        var listener = function listener(evt) {
	          if (evt.data.source === "apollo-devtools-proxy" && evt.data.payload) {
	            fn(evt.data.payload);
	          }
	        };
	        window.addEventListener("message", listener);
	        listeners.push(listener);
	      },
	      send: function send(data) {
	        window.postMessage({
	          source: "apollo-devtools-backend",
	          payload: data
	        }, "*");
	      }
	    });

	    bridge.on("shutdown", function () {
	      listeners.forEach(function (l) {
	        window.removeEventListener("message", l);
	      });
	      listeners = [];
	    });

	    (0, _backend.initBackend)(bridge);
	  }
	}

/***/ }),

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.initBackend = undefined;

	var _broadcastQueries = __webpack_require__(2);

	var _links = __webpack_require__(3);

	// hook should have been injected before this executes.
	// This is the agent that is injected into the page that an Apollo Client app lives in
	// when the Apollo Devtools panel is activated.
	var hook = window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__;
	var bridge = void 0;

	var connect = function connect() {
	  (0, _links.initLinkEvents)(hook, bridge);
	  (0, _broadcastQueries.initBroadCastEvents)(hook, bridge);
	  bridge.log("backend ready.");
	  bridge.send("ready", hook.ApolloClient.version);

	  console.log("%c apollo-devtools %c Detected Apollo Client v" + hook.ApolloClient.version + " %c", "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff", "background:#22A699 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff", "background:transparent");
	};

	var initBackend = exports.initBackend = function initBackend(b) {
	  bridge = b;

	  // wire up listeners
	  if (hook.ApolloClient) {
	    connect();
	  } else {
	    hook.once("init", connect);
	  }
	};

/***/ }),

/***/ 2:
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var initBroadCastEvents = exports.initBroadCastEvents = function initBroadCastEvents(hook, bridge) {
	  var logger = function logger(_ref) {
	    var _ref$state = _ref.state,
	        queries = _ref$state.queries,
	        mutations = _ref$state.mutations,
	        inspector = _ref.dataWithOptimisticResults;

	    bridge.send("broadcast:new", JSON.stringify({
	      queries: queries,
	      mutations: mutations,
	      inspector: inspector
	    }));
	  };

	  if (hook.actionLog.length) {
	    bridge.send("broadcast:initial", JSON.stringify(hook.actionLog));
	  }

	  hook.ApolloClient.__actionHookForDevTools(logger);
	};

/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.initLinkEvents = undefined;

	var _apolloLink = __webpack_require__(4);

	var _graphqlTag = __webpack_require__(359);

	var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var initLinkEvents = exports.initLinkEvents = function initLinkEvents(hook, bridge) {
	  var link = hook.ApolloClient.link;
	  var cache = hook.ApolloClient.cache;

	  var cachelink = new _apolloLink.ApolloLink(function (operation, forward) {
	    // XXX get some data from links here?
	    // add cache to link chain like AC does
	    operation.setContext({ cache: cache });
	    return forward(operation);
	  });
	  var devtoolsLink = cachelink.concat(link);

	  // handle incoming requests
	  var subscriber = function subscriber(request) {
	    var _JSON$parse = JSON.parse(request),
	        query = _JSON$parse.query,
	        variables = _JSON$parse.variables,
	        operationName = _JSON$parse.operationName,
	        key = _JSON$parse.key;

	    try {
	      var obs = (0, _apolloLink.execute)(devtoolsLink, {
	        query: (0, _graphqlTag2.default)(query),
	        variables: variables,
	        operationName: operationName
	      });
	      obs.subscribe({
	        next: function next(data) {
	          return bridge.send("link:next:" + key, JSON.stringify(data));
	        },
	        error: function error(err) {
	          return bridge.send("link:error:" + key, JSON.stringify(err));
	        },
	        complete: function complete() {
	          return bridge.send("link:complete:" + key);
	        }
	      });
	    } catch (e) {
	      bridge.send("link:error:" + key, JSON.stringify(e));
	    }
	  };

	  bridge.on("link:operation", subscriber);
	};

/***/ }),

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

	(function (global, factory) {
		 true ? factory(exports, __webpack_require__(5), __webpack_require__(8), __webpack_require__(10)) :
		typeof define === 'function' && define.amd ? define(['exports', 'zen-observable', 'apollo-utilities', 'graphql/language/printer'], factory) :
		(factory((global.apolloLink = global.apolloLink || {}, global.apolloLink.core = {}),global.Observable,global.apollo.utilities,global.printer));
	}(this, (function (exports,Observable,apolloUtilities,printer) { 'use strict';

	var __extends = (undefined && undefined.__extends) || (function () {
	    var extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	            t[p] = s[p];
	    }
	    return t;
	};
	function validateOperation(operation) {
	    var OPERATION_FIELDS = [
	        'query',
	        'operationName',
	        'variables',
	        'extensions',
	        'context',
	    ];
	    for (var _i = 0, _a = Object.keys(operation); _i < _a.length; _i++) {
	        var key = _a[_i];
	        if (OPERATION_FIELDS.indexOf(key) < 0) {
	            throw new Error("illegal argument: " + key);
	        }
	    }
	    return operation;
	}
	var LinkError = (function (_super) {
	    __extends(LinkError, _super);
	    function LinkError(message, link) {
	        var _this = _super.call(this, message) || this;
	        _this.link = link;
	        return _this;
	    }
	    return LinkError;
	}(Error));
	function isTerminating(link) {
	    return link.request.length <= 1;
	}
	function toPromise(observable) {
	    var completed = false;
	    return new Promise(function (resolve, reject) {
	        observable.subscribe({
	            next: function (data) {
	                if (completed) {
	                    console.warn("Promise Wrapper does not support multiple results from Observable");
	                }
	                else {
	                    completed = true;
	                    resolve(data);
	                }
	            },
	            error: reject,
	        });
	    });
	}
	var makePromise = toPromise;
	function fromPromise(promise) {
	    return new Observable(function (observer) {
	        promise
	            .then(function (value) {
	            observer.next(value);
	            observer.complete();
	        })
	            .catch(observer.error.bind(observer));
	    });
	}
	function transformOperation(operation) {
	    var transformedOperation = {
	        variables: operation.variables || {},
	        extensions: operation.extensions || {},
	        operationName: operation.operationName,
	        query: operation.query,
	    };
	    if (!transformedOperation.operationName) {
	        transformedOperation.operationName =
	            typeof transformedOperation.query !== 'string'
	                ? apolloUtilities.getOperationName(transformedOperation.query)
	                : '';
	    }
	    return transformedOperation;
	}
	function createOperation(starting, operation) {
	    var context = __assign({}, starting);
	    var setContext = function (next) {
	        if (typeof next === 'function') {
	            context = __assign({}, context, next(context));
	        }
	        else {
	            context = __assign({}, context, next);
	        }
	    };
	    var getContext = function () { return (__assign({}, context)); };
	    Object.defineProperty(operation, 'setContext', {
	        enumerable: false,
	        value: setContext,
	    });
	    Object.defineProperty(operation, 'getContext', {
	        enumerable: false,
	        value: getContext,
	    });
	    Object.defineProperty(operation, 'toKey', {
	        enumerable: false,
	        value: function () { return getKey(operation); },
	    });
	    return operation;
	}
	function getKey(operation) {
	    return printer.print(operation.query) + "|" + JSON.stringify(operation.variables) + "|" + operation.operationName;
	}

	var passthrough = function (op, forward) { return (forward ? forward(op) : Observable.of()); };
	var toLink = function (handler) {
	    return typeof handler === 'function' ? new ApolloLink(handler) : handler;
	};
	var empty = function () {
	    return new ApolloLink(function (op, forward) { return Observable.of(); });
	};
	var from = function (links) {
	    if (links.length === 0)
	        return empty();
	    return links.map(toLink).reduce(function (x, y) { return x.concat(y); });
	};
	var split = function (test, left, right) {
	    if (right === void 0) { right = new ApolloLink(passthrough); }
	    var leftLink = toLink(left);
	    var rightLink = toLink(right);
	    if (isTerminating(leftLink) && isTerminating(rightLink)) {
	        return new ApolloLink(function (operation) {
	            return test(operation)
	                ? leftLink.request(operation) || Observable.of()
	                : rightLink.request(operation) || Observable.of();
	        });
	    }
	    else {
	        return new ApolloLink(function (operation, forward) {
	            return test(operation)
	                ? leftLink.request(operation, forward) || Observable.of()
	                : rightLink.request(operation, forward) || Observable.of();
	        });
	    }
	};
	var concat = function (first, second) {
	    var firstLink = toLink(first);
	    if (isTerminating(firstLink)) {
	        console.warn(new LinkError("You are calling concat on a terminating link, which will have no effect", firstLink));
	        return firstLink;
	    }
	    var nextLink = toLink(second);
	    if (isTerminating(nextLink)) {
	        return new ApolloLink(function (operation) {
	            return firstLink.request(operation, function (op) { return nextLink.request(op) || Observable.of(); }) || Observable.of();
	        });
	    }
	    else {
	        return new ApolloLink(function (operation, forward) {
	            return (firstLink.request(operation, function (op) {
	                return nextLink.request(op, forward) || Observable.of();
	            }) || Observable.of());
	        });
	    }
	};
	var ApolloLink = (function () {
	    function ApolloLink(request) {
	        if (request)
	            this.request = request;
	    }
	    ApolloLink.prototype.split = function (test, left, right) {
	        if (right === void 0) { right = new ApolloLink(passthrough); }
	        return this.concat(split(test, left, right));
	    };
	    ApolloLink.prototype.concat = function (next) {
	        return concat(this, next);
	    };
	    ApolloLink.prototype.request = function (operation, forward) {
	        throw new Error('request is not implemented');
	    };
	    ApolloLink.empty = empty;
	    ApolloLink.from = from;
	    ApolloLink.split = split;
	    return ApolloLink;
	}());
	function execute(link, operation) {
	    return (link.request(createOperation(operation.context, transformOperation(validateOperation(operation)))) || Observable.of());
	}

	exports.Observable = Observable;
	exports.createOperation = createOperation;
	exports.makePromise = makePromise;
	exports.toPromise = toPromise;
	exports.fromPromise = fromPromise;
	exports.empty = empty;
	exports.from = from;
	exports.split = split;
	exports.concat = concat;
	exports.ApolloLink = ApolloLink;
	exports.execute = execute;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));
	//# sourceMappingURL=bundle.umd.js.map


/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(6).Observable;


/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {'use strict'; (function(fn, name) { if (true) { fn(exports, module); } else if (typeof self !== "undefined") { var e = name === "*" ? self : (name ? self[name] = {} : {}); fn(e, { exports: e }); } })(function(exports, module) { // === Symbol Support ===

	function hasSymbol(name) {
	  return typeof Symbol === "function" && Boolean(Symbol[name]);
	}

	function getSymbol(name) {
	  return hasSymbol(name) ? Symbol[name] : "@@" + name;
	}

	// Ponyfill Symbol.observable for interoperability with other libraries
	if (typeof Symbol === "function" && !Symbol.observable) {
	  Symbol.observable = Symbol("observable");
	}

	// === Abstract Operations ===

	function getMethod(obj, key) {
	  var value = obj[key];

	  if (value == null)
	    return undefined;

	  if (typeof value !== "function")
	    throw new TypeError(value + " is not a function");

	  return value;
	}

	function getSpecies(obj) {
	  var ctor = obj.constructor;
	  if (ctor !== undefined) {
	    ctor = ctor[getSymbol("species")];
	    if (ctor === null) {
	      ctor = undefined;
	    }
	  }
	  return ctor !== undefined ? ctor : Observable;
	}

	function addMethods(target, methods) {
	  Object.keys(methods).forEach(function(k) {
	    var desc = Object.getOwnPropertyDescriptor(methods, k);
	    desc.enumerable = false;
	    Object.defineProperty(target, k, desc);
	  });
	}

	function cleanupSubscription(subscription) {
	  // Assert:  observer._observer is undefined

	  var cleanup = subscription._cleanup;

	  if (!cleanup)
	    return;

	  // Drop the reference to the cleanup function so that we won't call it
	  // more than once
	  subscription._cleanup = undefined;

	  // Call the cleanup function
	  cleanup();
	}

	function subscriptionClosed(subscription) {
	  return subscription._observer === undefined;
	}

	function closeSubscription(subscription) {
	  if (subscriptionClosed(subscription))
	    return;

	  subscription._observer = undefined;
	  cleanupSubscription(subscription);
	}

	function cleanupFromSubscription(subscription) {
	  return function() { subscription.unsubscribe() };
	}

	function Subscription(observer, subscriber) {
	  // Assert: subscriber is callable

	  // The observer must be an object
	  if (Object(observer) !== observer)
	    throw new TypeError("Observer must be an object");

	  this._cleanup = undefined;
	  this._observer = observer;

	  var start = getMethod(observer, "start");

	  if (start)
	    start.call(observer, this);

	  if (subscriptionClosed(this))
	    return;

	  observer = new SubscriptionObserver(this);

	  try {
	    // Call the subscriber function
	    var cleanup$0 = subscriber.call(undefined, observer);

	    // The return value must be undefined, null, a subscription object, or a function
	    if (cleanup$0 != null) {
	      if (typeof cleanup$0.unsubscribe === "function")
	        cleanup$0 = cleanupFromSubscription(cleanup$0);
	      else if (typeof cleanup$0 !== "function")
	        throw new TypeError(cleanup$0 + " is not a function");

	      this._cleanup = cleanup$0;
	    }
	  } catch (e) {
	    // If an error occurs during startup, then attempt to send the error
	    // to the observer
	    observer.error(e);
	    return;
	  }

	  // If the stream is already finished, then perform cleanup
	  if (subscriptionClosed(this))
	    cleanupSubscription(this);
	}

	addMethods(Subscription.prototype = {}, {
	  get closed() { return subscriptionClosed(this) },
	  unsubscribe: function() { closeSubscription(this) },
	});

	function SubscriptionObserver(subscription) {
	  this._subscription = subscription;
	}

	addMethods(SubscriptionObserver.prototype = {}, {

	  get closed() { return subscriptionClosed(this._subscription) },

	  next: function(value) {
	    var subscription = this._subscription;

	    // If the stream is closed, then return undefined
	    if (subscriptionClosed(subscription))
	      return undefined;

	    var observer = subscription._observer;
	    var m = getMethod(observer, "next");

	    // If the observer doesn't support "next", then return undefined
	    if (!m)
	      return undefined;

	    // Send the next value to the sink
	    return m.call(observer, value);
	  },

	  error: function(value) {
	    var subscription = this._subscription;

	    // If the stream is closed, throw the error to the caller
	    if (subscriptionClosed(subscription))
	      throw value;

	    var observer = subscription._observer;
	    subscription._observer = undefined;

	    try {
	      var m$0 = getMethod(observer, "error");

	      // If the sink does not support "error", then throw the error to the caller
	      if (!m$0)
	        throw value;

	      value = m$0.call(observer, value);
	    } catch (e) {
	      try { cleanupSubscription(subscription) }
	      finally { throw e }
	    }

	    cleanupSubscription(subscription);
	    return value;
	  },

	  complete: function(value) {
	    var subscription = this._subscription;

	    // If the stream is closed, then return undefined
	    if (subscriptionClosed(subscription))
	      return undefined;

	    var observer = subscription._observer;
	    subscription._observer = undefined;

	    try {
	      var m$1 = getMethod(observer, "complete");

	      // If the sink does not support "complete", then return undefined
	      value = m$1 ? m$1.call(observer, value) : undefined;
	    } catch (e) {
	      try { cleanupSubscription(subscription) }
	      finally { throw e }
	    }

	    cleanupSubscription(subscription);
	    return value;
	  },

	});

	function Observable(subscriber) {
	  // The stream subscriber must be a function
	  if (typeof subscriber !== "function")
	    throw new TypeError("Observable initializer must be a function");

	  this._subscriber = subscriber;
	}

	addMethods(Observable.prototype, {

	  subscribe: function(observer) { for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) args.push(arguments[__$0]); 
	    if (typeof observer === 'function') {
	      observer = {
	        next: observer,
	        error: args[0],
	        complete: args[1],
	      };
	    }

	    return new Subscription(observer, this._subscriber);
	  },

	  forEach: function(fn) { var __this = this; 
	    return new Promise(function(resolve, reject) {
	      if (typeof fn !== "function")
	        return Promise.reject(new TypeError(fn + " is not a function"));

	      __this.subscribe({
	        _subscription: null,

	        start: function(subscription) {
	          if (Object(subscription) !== subscription)
	            throw new TypeError(subscription + " is not an object");

	          this._subscription = subscription;
	        },

	        next: function(value) {
	          var subscription = this._subscription;

	          if (subscription.closed)
	            return;

	          try {
	            return fn(value);
	          } catch (err) {
	            reject(err);
	            subscription.unsubscribe();
	          }
	        },

	        error: reject,
	        complete: resolve,
	      });
	    });
	  },

	  map: function(fn) { var __this = this; 
	    if (typeof fn !== "function")
	      throw new TypeError(fn + " is not a function");

	    var C = getSpecies(this);

	    return new C(function(observer) { return __this.subscribe({
	      next: function(value) {
	        if (observer.closed)
	          return;

	        try { value = fn(value) }
	        catch (e) { return observer.error(e) }

	        return observer.next(value);
	      },

	      error: function(e) { return observer.error(e) },
	      complete: function(x) { return observer.complete(x) },
	    }); });
	  },

	  filter: function(fn) { var __this = this; 
	    if (typeof fn !== "function")
	      throw new TypeError(fn + " is not a function");

	    var C = getSpecies(this);

	    return new C(function(observer) { return __this.subscribe({
	      next: function(value) {
	        if (observer.closed)
	          return;

	        try { if (!fn(value)) return undefined }
	        catch (e) { return observer.error(e) }

	        return observer.next(value);
	      },

	      error: function(e) { return observer.error(e) },
	      complete: function() { return observer.complete() },
	    }); });
	  },

	  reduce: function(fn) { var __this = this; 
	    if (typeof fn !== "function")
	      throw new TypeError(fn + " is not a function");

	    var C = getSpecies(this);
	    var hasSeed = arguments.length > 1;
	    var hasValue = false;
	    var seed = arguments[1];
	    var acc = seed;

	    return new C(function(observer) { return __this.subscribe({

	      next: function(value) {
	        if (observer.closed)
	          return;

	        var first = !hasValue;
	        hasValue = true;

	        if (!first || hasSeed) {
	          try { acc = fn(acc, value) }
	          catch (e) { return observer.error(e) }
	        } else {
	          acc = value;
	        }
	      },

	      error: function(e) { observer.error(e) },

	      complete: function() {
	        if (!hasValue && !hasSeed) {
	          observer.error(new TypeError("Cannot reduce an empty sequence"));
	          return;
	        }

	        observer.next(acc);
	        observer.complete();
	      },

	    }); });
	  },

	  flatMap: function(fn) { var __this = this; 
	    if (typeof fn !== "function")
	      throw new TypeError(fn + " is not a function");

	    var C = getSpecies(this);

	    return new C(function(observer) {
	      var completed = false;
	      var subscriptions = [];

	      // Subscribe to the outer Observable
	      var outer = __this.subscribe({

	        next: function(value) {
	          if (fn) {
	            try {
	              value = fn(value);
	            } catch (x) {
	              observer.error(x);
	              return;
	            }
	          }

	          // Subscribe to the inner Observable
	          Observable.from(value).subscribe({
	            _subscription: null,

	            start: function(s) { subscriptions.push(this._subscription = s) },
	            next: function(value) { observer.next(value) },
	            error: function(e) { observer.error(e) },

	            complete: function() {
	              var i = subscriptions.indexOf(this._subscription);

	              if (i >= 0)
	                subscriptions.splice(i, 1);

	              closeIfDone();
	            }
	          });
	        },

	        error: function(e) {
	          return observer.error(e);
	        },

	        complete: function() {
	          completed = true;
	          closeIfDone();
	        }
	      });

	      function closeIfDone() {
	        if (completed && subscriptions.length === 0)
	          observer.complete();
	      }

	      return function() {
	        subscriptions.forEach(function(s) { return s.unsubscribe(); });
	        outer.unsubscribe();
	      };
	    });
	  },

	});

	Object.defineProperty(Observable.prototype, getSymbol("observable"), {
	  value: function() { return this },
	  writable: true,
	  configurable: true,
	});

	addMethods(Observable, {

	  from: function(x) {
	    var C = typeof this === "function" ? this : Observable;

	    if (x == null)
	      throw new TypeError(x + " is not an object");

	    var method = getMethod(x, getSymbol("observable"));

	    if (method) {
	      var observable$0 = method.call(x);

	      if (Object(observable$0) !== observable$0)
	        throw new TypeError(observable$0 + " is not an object");

	      if (observable$0.constructor === C)
	        return observable$0;

	      return new C(function(observer) { return observable$0.subscribe(observer); });
	    }

	    if (hasSymbol("iterator") && (method = getMethod(x, getSymbol("iterator")))) {
	      return new C(function(observer) {
	        for (var __$0 = (method.call(x))[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;) { var item$0 = __$1.value; 
	          observer.next(item$0);
	          if (observer.closed)
	            return;
	        }

	        observer.complete();
	      });
	    }

	    if (Array.isArray(x)) {
	      return new C(function(observer) {
	        for (var i$0 = 0; i$0 < x.length; ++i$0) {
	          observer.next(x[i$0]);
	          if (observer.closed)
	            return;
	        }

	        observer.complete();
	      });
	    }

	    throw new TypeError(x + " is not observable");
	  },

	  of: function() { for (var items = [], __$0 = 0; __$0 < arguments.length; ++__$0) items.push(arguments[__$0]); 
	    var C = typeof this === "function" ? this : Observable;

	    return new C(function(observer) {
	      for (var i$1 = 0; i$1 < items.length; ++i$1) {
	        observer.next(items[i$1]);
	        if (observer.closed)
	          return;
	      }

	      observer.complete();
	    });
	  },

	});

	Object.defineProperty(Observable, getSymbol("species"), {
	  get: function() { return this },
	  configurable: true,
	});

	Object.defineProperty(Observable, "observableSymbol", {
	  value: getSymbol("observable"),
	});

	exports.Observable = Observable;


	}, "*");
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)(module)))

/***/ }),

/***/ 7:
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),

/***/ 8:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {(function (global, factory) {
		 true ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
		(factory((global.apollo = global.apollo || {}, global.apollo.utilities = {})));
	}(this, (function (exports) { 'use strict';

	function isScalarValue(value) {
	    return ['StringValue', 'BooleanValue', 'EnumValue'].indexOf(value.kind) > -1;
	}
	function isNumberValue(value) {
	    return ['IntValue', 'FloatValue'].indexOf(value.kind) > -1;
	}
	function isStringValue(value) {
	    return value.kind === 'StringValue';
	}
	function isBooleanValue(value) {
	    return value.kind === 'BooleanValue';
	}
	function isIntValue(value) {
	    return value.kind === 'IntValue';
	}
	function isFloatValue(value) {
	    return value.kind === 'FloatValue';
	}
	function isVariable(value) {
	    return value.kind === 'Variable';
	}
	function isObjectValue(value) {
	    return value.kind === 'ObjectValue';
	}
	function isListValue(value) {
	    return value.kind === 'ListValue';
	}
	function isEnumValue(value) {
	    return value.kind === 'EnumValue';
	}
	function valueToObjectRepresentation(argObj, name, value, variables) {
	    if (isIntValue(value) || isFloatValue(value)) {
	        argObj[name.value] = Number(value.value);
	    }
	    else if (isBooleanValue(value) || isStringValue(value)) {
	        argObj[name.value] = value.value;
	    }
	    else if (isObjectValue(value)) {
	        var nestedArgObj_1 = {};
	        value.fields.map(function (obj) {
	            return valueToObjectRepresentation(nestedArgObj_1, obj.name, obj.value, variables);
	        });
	        argObj[name.value] = nestedArgObj_1;
	    }
	    else if (isVariable(value)) {
	        var variableValue = (variables || {})[value.name.value];
	        argObj[name.value] = variableValue;
	    }
	    else if (isListValue(value)) {
	        argObj[name.value] = value.values.map(function (listValue) {
	            var nestedArgArrayObj = {};
	            valueToObjectRepresentation(nestedArgArrayObj, name, listValue, variables);
	            return nestedArgArrayObj[name.value];
	        });
	    }
	    else if (isEnumValue(value)) {
	        argObj[name.value] = value.value;
	    }
	    else {
	        throw new Error("The inline argument \"" + name.value + "\" of kind \"" + value.kind + "\" is not supported.\n                    Use variables instead of inline arguments to overcome this limitation.");
	    }
	}
	function storeKeyNameFromField(field, variables) {
	    var directivesObj = null;
	    if (field.directives) {
	        directivesObj = {};
	        field.directives.forEach(function (directive) {
	            directivesObj[directive.name.value] = {};
	            if (directive.arguments) {
	                directive.arguments.forEach(function (_a) {
	                    var name = _a.name, value = _a.value;
	                    return valueToObjectRepresentation(directivesObj[directive.name.value], name, value, variables);
	                });
	            }
	        });
	    }
	    var argObj = null;
	    if (field.arguments && field.arguments.length) {
	        argObj = {};
	        field.arguments.forEach(function (_a) {
	            var name = _a.name, value = _a.value;
	            return valueToObjectRepresentation(argObj, name, value, variables);
	        });
	    }
	    return getStoreKeyName(field.name.value, argObj, directivesObj);
	}
	function getStoreKeyName(fieldName, args, directives) {
	    if (directives &&
	        directives['connection'] &&
	        directives['connection']['key']) {
	        if (directives['connection']['filter'] &&
	            directives['connection']['filter'].length > 0) {
	            var filterKeys = directives['connection']['filter']
	                ? directives['connection']['filter']
	                : [];
	            filterKeys.sort();
	            var queryArgs_1 = args;
	            var filteredArgs_1 = {};
	            filterKeys.forEach(function (key) {
	                filteredArgs_1[key] = queryArgs_1[key];
	            });
	            return directives['connection']['key'] + "(" + JSON.stringify(filteredArgs_1) + ")";
	        }
	        else {
	            return directives['connection']['key'];
	        }
	    }
	    if (args) {
	        var stringifiedArgs = JSON.stringify(args);
	        return fieldName + "(" + stringifiedArgs + ")";
	    }
	    return fieldName;
	}
	function argumentsObjectFromField(field, variables) {
	    if (field.arguments && field.arguments.length) {
	        var argObj_1 = {};
	        field.arguments.forEach(function (_a) {
	            var name = _a.name, value = _a.value;
	            return valueToObjectRepresentation(argObj_1, name, value, variables);
	        });
	        return argObj_1;
	    }
	    return null;
	}
	function resultKeyNameFromField(field) {
	    return field.alias ? field.alias.value : field.name.value;
	}
	function isField(selection) {
	    return selection.kind === 'Field';
	}
	function isInlineFragment(selection) {
	    return selection.kind === 'InlineFragment';
	}
	function isIdValue(idObject) {
	    return idObject && idObject.type === 'id';
	}
	function toIdValue(id, generated) {
	    if (generated === void 0) { generated = false; }
	    return {
	        type: 'id',
	        id: id,
	        generated: generated,
	    };
	}
	function isJsonValue(jsonObject) {
	    return (jsonObject != null &&
	        typeof jsonObject === 'object' &&
	        jsonObject.type === 'json');
	}
	function defaultValueFromVariable(node) {
	    throw new Error("Variable nodes are not supported by valueFromNode");
	}
	function valueFromNode(node, onVariable) {
	    if (onVariable === void 0) { onVariable = defaultValueFromVariable; }
	    switch (node.kind) {
	        case 'Variable':
	            return onVariable(node);
	        case 'NullValue':
	            return null;
	        case 'IntValue':
	            return parseInt(node.value);
	        case 'FloatValue':
	            return parseFloat(node.value);
	        case 'ListValue':
	            return node.values.map(function (v) { return valueFromNode(v, onVariable); });
	        case 'ObjectValue': {
	            var value = {};
	            for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
	                var field = _a[_i];
	                value[field.name.value] = valueFromNode(field.value, onVariable);
	            }
	            return value;
	        }
	        default:
	            return node.value;
	    }
	}

	function getDirectiveInfoFromField(field, variables) {
	    if (field.directives && field.directives.length) {
	        var directiveObj_1 = {};
	        field.directives.forEach(function (directive) {
	            directiveObj_1[directive.name.value] = argumentsObjectFromField(directive, variables);
	        });
	        return directiveObj_1;
	    }
	    return null;
	}
	function shouldInclude(selection, variables) {
	    if (variables === void 0) { variables = {}; }
	    if (!selection.directives) {
	        return true;
	    }
	    var res = true;
	    selection.directives.forEach(function (directive) {
	        if (directive.name.value !== 'skip' && directive.name.value !== 'include') {
	            return;
	        }
	        var directiveArguments = directive.arguments || [];
	        var directiveName = directive.name.value;
	        if (directiveArguments.length !== 1) {
	            throw new Error("Incorrect number of arguments for the @" + directiveName + " directive.");
	        }
	        var ifArgument = directiveArguments[0];
	        if (!ifArgument.name || ifArgument.name.value !== 'if') {
	            throw new Error("Invalid argument for the @" + directiveName + " directive.");
	        }
	        var ifValue = directiveArguments[0].value;
	        var evaledValue = false;
	        if (!ifValue || ifValue.kind !== 'BooleanValue') {
	            if (ifValue.kind !== 'Variable') {
	                throw new Error("Argument for the @" + directiveName + " directive must be a variable or a bool ean value.");
	            }
	            else {
	                evaledValue = variables[ifValue.name.value];
	                if (evaledValue === undefined) {
	                    throw new Error("Invalid variable referenced in @" + directiveName + " directive.");
	                }
	            }
	        }
	        else {
	            evaledValue = ifValue.value;
	        }
	        if (directiveName === 'skip') {
	            evaledValue = !evaledValue;
	        }
	        if (!evaledValue) {
	            res = false;
	        }
	    });
	    return res;
	}
	function flattenSelections(selection) {
	    if (!selection.selectionSet ||
	        !(selection.selectionSet.selections.length > 0))
	        return [selection];
	    return [selection].concat(selection.selectionSet.selections
	        .map(function (selectionNode) {
	        return [selectionNode].concat(flattenSelections(selectionNode));
	    })
	        .reduce(function (selections, selected) { return selections.concat(selected); }, []));
	}
	var added = new Map();
	function getDirectiveNames(doc) {
	    var cached = added.get(doc);
	    if (cached)
	        return cached;
	    var directives = doc.definitions
	        .filter(function (definition) {
	        return definition.selectionSet && definition.selectionSet.selections;
	    })
	        .map(function (x) { return flattenSelections(x); })
	        .reduce(function (selections, selected) { return selections.concat(selected); }, [])
	        .filter(function (selection) {
	        return selection.directives && selection.directives.length > 0;
	    })
	        .map(function (selection) { return selection.directives; })
	        .reduce(function (directives, directive) { return directives.concat(directive); }, [])
	        .map(function (directive) { return directive.name.value; });
	    added.set(doc, directives);
	    return directives;
	}
	function hasDirectives(names, doc) {
	    return getDirectiveNames(doc).some(function (name) { return names.indexOf(name) > -1; });
	}

	var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	            t[p] = s[p];
	    }
	    return t;
	};
	function getFragmentQueryDocument(document, fragmentName) {
	    var actualFragmentName = fragmentName;
	    var fragments = [];
	    document.definitions.forEach(function (definition) {
	        if (definition.kind === 'OperationDefinition') {
	            throw new Error("Found a " + definition.operation + " operation" + (definition.name ? " named '" + definition.name.value + "'" : '') + ". " +
	                'No operations are allowed when using a fragment as a query. Only fragments are allowed.');
	        }
	        if (definition.kind === 'FragmentDefinition') {
	            fragments.push(definition);
	        }
	    });
	    if (typeof actualFragmentName === 'undefined') {
	        if (fragments.length !== 1) {
	            throw new Error("Found " + fragments.length + " fragments. `fragmentName` must be provided when there is not exactly 1 fragment.");
	        }
	        actualFragmentName = fragments[0].name.value;
	    }
	    var query = __assign({}, document, { definitions: [
	            {
	                kind: 'OperationDefinition',
	                operation: 'query',
	                selectionSet: {
	                    kind: 'SelectionSet',
	                    selections: [
	                        {
	                            kind: 'FragmentSpread',
	                            name: {
	                                kind: 'Name',
	                                value: actualFragmentName,
	                            },
	                        },
	                    ],
	                },
	            }
	        ].concat(document.definitions) });
	    return query;
	}

	function assign(target) {
	    var sources = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        sources[_i - 1] = arguments[_i];
	    }
	    sources.forEach(function (source) {
	        if (typeof source === 'undefined' || source === null) {
	            return;
	        }
	        Object.keys(source).forEach(function (key) {
	            target[key] = source[key];
	        });
	    });
	    return target;
	}

	function getMutationDefinition(doc) {
	    checkDocument(doc);
	    var mutationDef = doc.definitions.filter(function (definition) {
	        return definition.kind === 'OperationDefinition' &&
	            definition.operation === 'mutation';
	    })[0];
	    if (!mutationDef) {
	        throw new Error('Must contain a mutation definition.');
	    }
	    return mutationDef;
	}
	function checkDocument(doc) {
	    if (doc.kind !== 'Document') {
	        throw new Error("Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
	    }
	    var operations = doc.definitions
	        .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
	        .map(function (definition) {
	        if (definition.kind !== 'OperationDefinition') {
	            throw new Error("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
	        }
	        return definition;
	    });
	    if (operations.length > 1) {
	        throw new Error("Ambiguous GraphQL document: contains " + operations.length + " operations");
	    }
	}
	function getOperationDefinition(doc) {
	    checkDocument(doc);
	    return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
	}
	function getOperationDefinitionOrDie(document) {
	    var def = getOperationDefinition(document);
	    if (!def) {
	        throw new Error("GraphQL document is missing an operation");
	    }
	    return def;
	}
	function getOperationName(doc) {
	    return (doc.definitions
	        .filter(function (definition) {
	        return definition.kind === 'OperationDefinition' && definition.name;
	    })
	        .map(function (x) { return x.name.value; })[0] || null);
	}
	function getFragmentDefinitions(doc) {
	    return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
	}
	function getQueryDefinition(doc) {
	    var queryDef = getOperationDefinition(doc);
	    if (!queryDef || queryDef.operation !== 'query') {
	        throw new Error('Must contain a query definition.');
	    }
	    return queryDef;
	}
	function getFragmentDefinition(doc) {
	    if (doc.kind !== 'Document') {
	        throw new Error("Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
	    }
	    if (doc.definitions.length > 1) {
	        throw new Error('Fragment must have exactly one definition.');
	    }
	    var fragmentDef = doc.definitions[0];
	    if (fragmentDef.kind !== 'FragmentDefinition') {
	        throw new Error('Must be a fragment definition.');
	    }
	    return fragmentDef;
	}
	function getMainDefinition(queryDoc) {
	    checkDocument(queryDoc);
	    var fragmentDefinition;
	    for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
	        var definition = _a[_i];
	        if (definition.kind === 'OperationDefinition') {
	            var operation = definition.operation;
	            if (operation === 'query' ||
	                operation === 'mutation' ||
	                operation === 'subscription') {
	                return definition;
	            }
	        }
	        if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
	            fragmentDefinition = definition;
	        }
	    }
	    if (fragmentDefinition) {
	        return fragmentDefinition;
	    }
	    throw new Error('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
	}
	function createFragmentMap(fragments) {
	    if (fragments === void 0) { fragments = []; }
	    var symTable = {};
	    fragments.forEach(function (fragment) {
	        symTable[fragment.name.value] = fragment;
	    });
	    return symTable;
	}
	function getDefaultValues(definition) {
	    if (definition &&
	        definition.variableDefinitions &&
	        definition.variableDefinitions.length) {
	        var defaultValues = definition.variableDefinitions
	            .filter(function (_a) {
	            var defaultValue = _a.defaultValue;
	            return defaultValue;
	        })
	            .map(function (_a) {
	            var variable = _a.variable, defaultValue = _a.defaultValue;
	            var defaultValueObj = {};
	            valueToObjectRepresentation(defaultValueObj, variable.name, defaultValue);
	            return defaultValueObj;
	        });
	        return assign.apply(void 0, [{}].concat(defaultValues));
	    }
	    return {};
	}
	function variablesInOperation(operation) {
	    var names = new Set();
	    if (operation.variableDefinitions) {
	        for (var _i = 0, _a = operation.variableDefinitions; _i < _a.length; _i++) {
	            var definition = _a[_i];
	            names.add(definition.variable.name.value);
	        }
	    }
	    return names;
	}

	function cloneDeep(value) {
	    if (Array.isArray(value)) {
	        return value.map(function (item) { return cloneDeep(item); });
	    }
	    if (value !== null && typeof value === 'object') {
	        var nextValue = {};
	        for (var key in value) {
	            if (value.hasOwnProperty(key)) {
	                nextValue[key] = cloneDeep(value[key]);
	            }
	        }
	        return nextValue;
	    }
	    return value;
	}

	var TYPENAME_FIELD = {
	    kind: 'Field',
	    name: {
	        kind: 'Name',
	        value: '__typename',
	    },
	};
	function addTypenameToSelectionSet(selectionSet, isRoot) {
	    if (isRoot === void 0) { isRoot = false; }
	    if (selectionSet.selections) {
	        if (!isRoot) {
	            var alreadyHasThisField = selectionSet.selections.some(function (selection) {
	                return (selection.kind === 'Field' &&
	                    selection.name.value === '__typename');
	            });
	            if (!alreadyHasThisField) {
	                selectionSet.selections.push(TYPENAME_FIELD);
	            }
	        }
	        selectionSet.selections.forEach(function (selection) {
	            if (selection.kind === 'Field') {
	                if (selection.name.value.lastIndexOf('__', 0) !== 0 &&
	                    selection.selectionSet) {
	                    addTypenameToSelectionSet(selection.selectionSet);
	                }
	            }
	            else if (selection.kind === 'InlineFragment') {
	                if (selection.selectionSet) {
	                    addTypenameToSelectionSet(selection.selectionSet);
	                }
	            }
	        });
	    }
	}
	function removeDirectivesFromSelectionSet(directives, selectionSet) {
	    if (!selectionSet.selections)
	        return selectionSet;
	    var agressiveRemove = directives.some(function (dir) { return dir.remove; });
	    selectionSet.selections = selectionSet.selections
	        .map(function (selection) {
	        if (selection.kind !== 'Field' ||
	            !selection ||
	            !selection.directives)
	            return selection;
	        var remove;
	        selection.directives = selection.directives.filter(function (directive) {
	            var shouldKeep = !directives.some(function (dir) {
	                if (dir.name && dir.name === directive.name.value)
	                    return true;
	                if (dir.test && dir.test(directive))
	                    return true;
	                return false;
	            });
	            if (!remove && !shouldKeep && agressiveRemove)
	                remove = true;
	            return shouldKeep;
	        });
	        return remove ? null : selection;
	    })
	        .filter(function (x) { return !!x; });
	    selectionSet.selections.forEach(function (selection) {
	        if ((selection.kind === 'Field' || selection.kind === 'InlineFragment') &&
	            selection.selectionSet) {
	            removeDirectivesFromSelectionSet(directives, selection.selectionSet);
	        }
	    });
	    return selectionSet;
	}
	function removeDirectivesFromDocument(directives, doc) {
	    var docClone = cloneDeep(doc);
	    docClone.definitions.forEach(function (definition) {
	        removeDirectivesFromSelectionSet(directives, definition.selectionSet);
	    });
	    var operation = getOperationDefinitionOrDie(docClone);
	    var fragments = createFragmentMap(getFragmentDefinitions(docClone));
	    var isNotEmpty = function (op) {
	        return op.selectionSet.selections.filter(function (selectionSet) {
	            return !(selectionSet &&
	                selectionSet.kind === 'FragmentSpread' &&
	                !isNotEmpty(fragments[selectionSet.name.value]));
	        }).length > 0;
	    };
	    return isNotEmpty(operation) ? docClone : null;
	}
	var added$1 = new Map();
	function addTypenameToDocument(doc) {
	    checkDocument(doc);
	    var cached = added$1.get(doc);
	    if (cached)
	        return cached;
	    var docClone = cloneDeep(doc);
	    docClone.definitions.forEach(function (definition) {
	        var isRoot = definition.kind === 'OperationDefinition';
	        addTypenameToSelectionSet(definition.selectionSet, isRoot);
	    });
	    added$1.set(doc, docClone);
	    return docClone;
	}
	var connectionRemoveConfig = {
	    test: function (directive) {
	        var willRemove = directive.name.value === 'connection';
	        if (willRemove) {
	            if (!directive.arguments ||
	                !directive.arguments.some(function (arg) { return arg.name.value === 'key'; })) {
	                console.warn('Removing an @connection directive even though it does not have a key. ' +
	                    'You may want to use the key parameter to specify a store key.');
	            }
	        }
	        return willRemove;
	    },
	};
	var removed = new Map();
	function removeConnectionDirectiveFromDocument(doc) {
	    checkDocument(doc);
	    var cached = removed.get(doc);
	    if (cached)
	        return cached;
	    var docClone = removeDirectivesFromDocument([connectionRemoveConfig], doc);
	    removed.set(doc, docClone);
	    return docClone;
	}

	function getEnv() {
	    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
	        return process.env.NODE_ENV;
	    }
	    return 'development';
	}
	function isEnv(env) {
	    return getEnv() === env;
	}
	function isProduction() {
	    return isEnv('production') === true;
	}
	function isDevelopment() {
	    return isEnv('development') === true;
	}
	function isTest() {
	    return isEnv('test') === true;
	}

	function tryFunctionOrLogError(f) {
	    try {
	        return f();
	    }
	    catch (e) {
	        if (console.error) {
	            console.error(e);
	        }
	    }
	}
	function graphQLResultHasError(result) {
	    return result.errors && result.errors.length;
	}

	function isEqual(a, b) {
	    if (a === b) {
	        return true;
	    }
	    if (a instanceof Date && b instanceof Date) {
	        return a.getTime() === b.getTime();
	    }
	    if (a != null &&
	        typeof a === 'object' &&
	        b != null &&
	        typeof b === 'object') {
	        for (var key in a) {
	            if (Object.prototype.hasOwnProperty.call(a, key)) {
	                if (!Object.prototype.hasOwnProperty.call(b, key)) {
	                    return false;
	                }
	                if (!isEqual(a[key], b[key])) {
	                    return false;
	                }
	            }
	        }
	        for (var key in b) {
	            if (!Object.prototype.hasOwnProperty.call(a, key)) {
	                return false;
	            }
	        }
	        return true;
	    }
	    return false;
	}

	function deepFreeze(o) {
	    Object.freeze(o);
	    Object.getOwnPropertyNames(o).forEach(function (prop) {
	        if (o.hasOwnProperty(prop) &&
	            o[prop] !== null &&
	            (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
	            !Object.isFrozen(o[prop])) {
	            deepFreeze(o[prop]);
	        }
	    });
	    return o;
	}
	function maybeDeepFreeze(obj) {
	    if (isDevelopment() || isTest()) {
	        return deepFreeze(obj);
	    }
	    return obj;
	}

	var haveWarned = Object.create({});
	function warnOnceInDevelopment(msg, type) {
	    if (type === void 0) { type = 'warn'; }
	    if (isProduction()) {
	        return;
	    }
	    if (!haveWarned[msg]) {
	        if (!isTest()) {
	            haveWarned[msg] = true;
	        }
	        switch (type) {
	            case 'error':
	                console.error(msg);
	                break;
	            default:
	                console.warn(msg);
	        }
	    }
	}

	exports.getDirectiveInfoFromField = getDirectiveInfoFromField;
	exports.shouldInclude = shouldInclude;
	exports.flattenSelections = flattenSelections;
	exports.getDirectiveNames = getDirectiveNames;
	exports.hasDirectives = hasDirectives;
	exports.getFragmentQueryDocument = getFragmentQueryDocument;
	exports.getMutationDefinition = getMutationDefinition;
	exports.checkDocument = checkDocument;
	exports.getOperationDefinition = getOperationDefinition;
	exports.getOperationDefinitionOrDie = getOperationDefinitionOrDie;
	exports.getOperationName = getOperationName;
	exports.getFragmentDefinitions = getFragmentDefinitions;
	exports.getQueryDefinition = getQueryDefinition;
	exports.getFragmentDefinition = getFragmentDefinition;
	exports.getMainDefinition = getMainDefinition;
	exports.createFragmentMap = createFragmentMap;
	exports.getDefaultValues = getDefaultValues;
	exports.variablesInOperation = variablesInOperation;
	exports.removeDirectivesFromDocument = removeDirectivesFromDocument;
	exports.addTypenameToDocument = addTypenameToDocument;
	exports.removeConnectionDirectiveFromDocument = removeConnectionDirectiveFromDocument;
	exports.isScalarValue = isScalarValue;
	exports.isNumberValue = isNumberValue;
	exports.valueToObjectRepresentation = valueToObjectRepresentation;
	exports.storeKeyNameFromField = storeKeyNameFromField;
	exports.getStoreKeyName = getStoreKeyName;
	exports.argumentsObjectFromField = argumentsObjectFromField;
	exports.resultKeyNameFromField = resultKeyNameFromField;
	exports.isField = isField;
	exports.isInlineFragment = isInlineFragment;
	exports.isIdValue = isIdValue;
	exports.toIdValue = toIdValue;
	exports.isJsonValue = isJsonValue;
	exports.valueFromNode = valueFromNode;
	exports.assign = assign;
	exports.cloneDeep = cloneDeep;
	exports.getEnv = getEnv;
	exports.isEnv = isEnv;
	exports.isProduction = isProduction;
	exports.isDevelopment = isDevelopment;
	exports.isTest = isTest;
	exports.tryFunctionOrLogError = tryFunctionOrLogError;
	exports.graphQLResultHasError = graphQLResultHasError;
	exports.isEqual = isEqual;
	exports.maybeDeepFreeze = maybeDeepFreeze;
	exports.warnOnceInDevelopment = warnOnceInDevelopment;

	Object.defineProperty(exports, '__esModule', { value: true });

	})));
	//# sourceMappingURL=bundle.umd.js.map

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),

/***/ 9:
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.print = print;

	var _visitor = __webpack_require__(11);

	/**
	 * Converts an AST into a string, using one set of reasonable
	 * formatting rules.
	 */
	function print(ast) {
	  return (0, _visitor.visit)(ast, { leave: printDocASTReducer });
	} /**
	   * Copyright (c) 2015-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   */

	var printDocASTReducer = {
	  Name: function Name(node) {
	    return node.value;
	  },
	  Variable: function Variable(node) {
	    return '$' + node.name;
	  },

	  // Document

	  Document: function Document(node) {
	    return join(node.definitions, '\n\n') + '\n';
	  },

	  OperationDefinition: function OperationDefinition(node) {
	    var op = node.operation;
	    var name = node.name;
	    var varDefs = wrap('(', join(node.variableDefinitions, ', '), ')');
	    var directives = join(node.directives, ' ');
	    var selectionSet = node.selectionSet;
	    // Anonymous queries with no directives or variable definitions can use
	    // the query short form.
	    return !name && !directives && !varDefs && op === 'query' ? selectionSet : join([op, join([name, varDefs]), directives, selectionSet], ' ');
	  },


	  VariableDefinition: function VariableDefinition(_ref) {
	    var variable = _ref.variable,
	        type = _ref.type,
	        defaultValue = _ref.defaultValue;
	    return variable + ': ' + type + wrap(' = ', defaultValue);
	  },

	  SelectionSet: function SelectionSet(_ref2) {
	    var selections = _ref2.selections;
	    return block(selections);
	  },

	  Field: function Field(_ref3) {
	    var alias = _ref3.alias,
	        name = _ref3.name,
	        args = _ref3.arguments,
	        directives = _ref3.directives,
	        selectionSet = _ref3.selectionSet;
	    return join([wrap('', alias, ': ') + name + wrap('(', join(args, ', '), ')'), join(directives, ' '), selectionSet], ' ');
	  },

	  Argument: function Argument(_ref4) {
	    var name = _ref4.name,
	        value = _ref4.value;
	    return name + ': ' + value;
	  },

	  // Fragments

	  FragmentSpread: function FragmentSpread(_ref5) {
	    var name = _ref5.name,
	        directives = _ref5.directives;
	    return '...' + name + wrap(' ', join(directives, ' '));
	  },

	  InlineFragment: function InlineFragment(_ref6) {
	    var typeCondition = _ref6.typeCondition,
	        directives = _ref6.directives,
	        selectionSet = _ref6.selectionSet;
	    return join(['...', wrap('on ', typeCondition), join(directives, ' '), selectionSet], ' ');
	  },

	  FragmentDefinition: function FragmentDefinition(_ref7) {
	    var name = _ref7.name,
	        typeCondition = _ref7.typeCondition,
	        directives = _ref7.directives,
	        selectionSet = _ref7.selectionSet;
	    return 'fragment ' + name + ' on ' + typeCondition + ' ' + wrap('', join(directives, ' '), ' ') + selectionSet;
	  },

	  // Value

	  IntValue: function IntValue(_ref8) {
	    var value = _ref8.value;
	    return value;
	  },
	  FloatValue: function FloatValue(_ref9) {
	    var value = _ref9.value;
	    return value;
	  },
	  StringValue: function StringValue(_ref10) {
	    var value = _ref10.value;
	    return JSON.stringify(value);
	  },
	  BooleanValue: function BooleanValue(_ref11) {
	    var value = _ref11.value;
	    return JSON.stringify(value);
	  },
	  NullValue: function NullValue() {
	    return 'null';
	  },
	  EnumValue: function EnumValue(_ref12) {
	    var value = _ref12.value;
	    return value;
	  },
	  ListValue: function ListValue(_ref13) {
	    var values = _ref13.values;
	    return '[' + join(values, ', ') + ']';
	  },
	  ObjectValue: function ObjectValue(_ref14) {
	    var fields = _ref14.fields;
	    return '{' + join(fields, ', ') + '}';
	  },
	  ObjectField: function ObjectField(_ref15) {
	    var name = _ref15.name,
	        value = _ref15.value;
	    return name + ': ' + value;
	  },

	  // Directive

	  Directive: function Directive(_ref16) {
	    var name = _ref16.name,
	        args = _ref16.arguments;
	    return '@' + name + wrap('(', join(args, ', '), ')');
	  },

	  // Type

	  NamedType: function NamedType(_ref17) {
	    var name = _ref17.name;
	    return name;
	  },
	  ListType: function ListType(_ref18) {
	    var type = _ref18.type;
	    return '[' + type + ']';
	  },
	  NonNullType: function NonNullType(_ref19) {
	    var type = _ref19.type;
	    return type + '!';
	  },

	  // Type System Definitions

	  SchemaDefinition: function SchemaDefinition(_ref20) {
	    var directives = _ref20.directives,
	        operationTypes = _ref20.operationTypes;
	    return join(['schema', join(directives, ' '), block(operationTypes)], ' ');
	  },

	  OperationTypeDefinition: function OperationTypeDefinition(_ref21) {
	    var operation = _ref21.operation,
	        type = _ref21.type;
	    return operation + ': ' + type;
	  },

	  ScalarTypeDefinition: function ScalarTypeDefinition(_ref22) {
	    var name = _ref22.name,
	        directives = _ref22.directives;
	    return join(['scalar', name, join(directives, ' ')], ' ');
	  },

	  ObjectTypeDefinition: function ObjectTypeDefinition(_ref23) {
	    var name = _ref23.name,
	        interfaces = _ref23.interfaces,
	        directives = _ref23.directives,
	        fields = _ref23.fields;
	    return join(['type', name, wrap('implements ', join(interfaces, ', ')), join(directives, ' '), block(fields)], ' ');
	  },

	  FieldDefinition: function FieldDefinition(_ref24) {
	    var name = _ref24.name,
	        args = _ref24.arguments,
	        type = _ref24.type,
	        directives = _ref24.directives;
	    return name + wrap('(', join(args, ', '), ')') + ': ' + type + wrap(' ', join(directives, ' '));
	  },

	  InputValueDefinition: function InputValueDefinition(_ref25) {
	    var name = _ref25.name,
	        type = _ref25.type,
	        defaultValue = _ref25.defaultValue,
	        directives = _ref25.directives;
	    return join([name + ': ' + type, wrap('= ', defaultValue), join(directives, ' ')], ' ');
	  },

	  InterfaceTypeDefinition: function InterfaceTypeDefinition(_ref26) {
	    var name = _ref26.name,
	        directives = _ref26.directives,
	        fields = _ref26.fields;
	    return join(['interface', name, join(directives, ' '), block(fields)], ' ');
	  },

	  UnionTypeDefinition: function UnionTypeDefinition(_ref27) {
	    var name = _ref27.name,
	        directives = _ref27.directives,
	        types = _ref27.types;
	    return join(['union', name, join(directives, ' '), '= ' + join(types, ' | ')], ' ');
	  },

	  EnumTypeDefinition: function EnumTypeDefinition(_ref28) {
	    var name = _ref28.name,
	        directives = _ref28.directives,
	        values = _ref28.values;
	    return join(['enum', name, join(directives, ' '), block(values)], ' ');
	  },

	  EnumValueDefinition: function EnumValueDefinition(_ref29) {
	    var name = _ref29.name,
	        directives = _ref29.directives;
	    return join([name, join(directives, ' ')], ' ');
	  },

	  InputObjectTypeDefinition: function InputObjectTypeDefinition(_ref30) {
	    var name = _ref30.name,
	        directives = _ref30.directives,
	        fields = _ref30.fields;
	    return join(['input', name, join(directives, ' '), block(fields)], ' ');
	  },

	  TypeExtensionDefinition: function TypeExtensionDefinition(_ref31) {
	    var definition = _ref31.definition;
	    return 'extend ' + definition;
	  },

	  DirectiveDefinition: function DirectiveDefinition(_ref32) {
	    var name = _ref32.name,
	        args = _ref32.arguments,
	        locations = _ref32.locations;
	    return 'directive @' + name + wrap('(', join(args, ', '), ')') + ' on ' + join(locations, ' | ');
	  }
	};

	/**
	 * Given maybeArray, print an empty string if it is null or empty, otherwise
	 * print all items together separated by separator if provided
	 */
	function join(maybeArray, separator) {
	  return maybeArray ? maybeArray.filter(function (x) {
	    return x;
	  }).join(separator || '') : '';
	}

	/**
	 * Given array, print each item on its own line, wrapped in an
	 * indented "{ }" block.
	 */
	function block(array) {
	  return array && array.length !== 0 ? indent('{\n' + join(array, '\n')) + '\n}' : '{}';
	}

	/**
	 * If maybeString is not null or empty, then wrap with start and end, otherwise
	 * print an empty string.
	 */
	function wrap(start, maybeString, end) {
	  return maybeString ? start + maybeString + (end || '') : '';
	}

	function indent(maybeString) {
	  return maybeString && maybeString.replace(/\n/g, '\n  ');
	}

/***/ }),

/***/ 11:
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.visit = visit;
	exports.visitInParallel = visitInParallel;
	exports.visitWithTypeInfo = visitWithTypeInfo;
	exports.getVisitFn = getVisitFn;
	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var QueryDocumentKeys = exports.QueryDocumentKeys = {
	  Name: [],

	  Document: ['definitions'],
	  OperationDefinition: ['name', 'variableDefinitions', 'directives', 'selectionSet'],
	  VariableDefinition: ['variable', 'type', 'defaultValue'],
	  Variable: ['name'],
	  SelectionSet: ['selections'],
	  Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
	  Argument: ['name', 'value'],

	  FragmentSpread: ['name', 'directives'],
	  InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
	  FragmentDefinition: ['name', 'typeCondition', 'directives', 'selectionSet'],

	  IntValue: [],
	  FloatValue: [],
	  StringValue: [],
	  BooleanValue: [],
	  NullValue: [],
	  EnumValue: [],
	  ListValue: ['values'],
	  ObjectValue: ['fields'],
	  ObjectField: ['name', 'value'],

	  Directive: ['name', 'arguments'],

	  NamedType: ['name'],
	  ListType: ['type'],
	  NonNullType: ['type'],

	  SchemaDefinition: ['directives', 'operationTypes'],
	  OperationTypeDefinition: ['type'],

	  ScalarTypeDefinition: ['name', 'directives'],
	  ObjectTypeDefinition: ['name', 'interfaces', 'directives', 'fields'],
	  FieldDefinition: ['name', 'arguments', 'type', 'directives'],
	  InputValueDefinition: ['name', 'type', 'defaultValue', 'directives'],
	  InterfaceTypeDefinition: ['name', 'directives', 'fields'],
	  UnionTypeDefinition: ['name', 'directives', 'types'],
	  EnumTypeDefinition: ['name', 'directives', 'values'],
	  EnumValueDefinition: ['name', 'directives'],
	  InputObjectTypeDefinition: ['name', 'directives', 'fields'],

	  TypeExtensionDefinition: ['definition'],

	  DirectiveDefinition: ['name', 'arguments', 'locations']
	};

	var BREAK = exports.BREAK = {};

	/**
	 * visit() will walk through an AST using a depth first traversal, calling
	 * the visitor's enter function at each node in the traversal, and calling the
	 * leave function after visiting that node and all of its child nodes.
	 *
	 * By returning different values from the enter and leave functions, the
	 * behavior of the visitor can be altered, including skipping over a sub-tree of
	 * the AST (by returning false), editing the AST by returning a value or null
	 * to remove the value, or to stop the whole traversal by returning BREAK.
	 *
	 * When using visit() to edit an AST, the original AST will not be modified, and
	 * a new version of the AST with the changes applied will be returned from the
	 * visit function.
	 *
	 *     const editedAST = visit(ast, {
	 *       enter(node, key, parent, path, ancestors) {
	 *         // @return
	 *         //   undefined: no action
	 *         //   false: skip visiting this node
	 *         //   visitor.BREAK: stop visiting altogether
	 *         //   null: delete this node
	 *         //   any value: replace this node with the returned value
	 *       },
	 *       leave(node, key, parent, path, ancestors) {
	 *         // @return
	 *         //   undefined: no action
	 *         //   false: no action
	 *         //   visitor.BREAK: stop visiting altogether
	 *         //   null: delete this node
	 *         //   any value: replace this node with the returned value
	 *       }
	 *     });
	 *
	 * Alternatively to providing enter() and leave() functions, a visitor can
	 * instead provide functions named the same as the kinds of AST nodes, or
	 * enter/leave visitors at a named key, leading to four permutations of
	 * visitor API:
	 *
	 * 1) Named visitors triggered when entering a node a specific kind.
	 *
	 *     visit(ast, {
	 *       Kind(node) {
	 *         // enter the "Kind" node
	 *       }
	 *     })
	 *
	 * 2) Named visitors that trigger upon entering and leaving a node of
	 *    a specific kind.
	 *
	 *     visit(ast, {
	 *       Kind: {
	 *         enter(node) {
	 *           // enter the "Kind" node
	 *         }
	 *         leave(node) {
	 *           // leave the "Kind" node
	 *         }
	 *       }
	 *     })
	 *
	 * 3) Generic visitors that trigger upon entering and leaving any node.
	 *
	 *     visit(ast, {
	 *       enter(node) {
	 *         // enter any node
	 *       },
	 *       leave(node) {
	 *         // leave any node
	 *       }
	 *     })
	 *
	 * 4) Parallel visitors for entering and leaving nodes of a specific kind.
	 *
	 *     visit(ast, {
	 *       enter: {
	 *         Kind(node) {
	 *           // enter the "Kind" node
	 *         }
	 *       },
	 *       leave: {
	 *         Kind(node) {
	 *           // leave the "Kind" node
	 *         }
	 *       }
	 *     })
	 */
	function visit(root, visitor, keyMap) {
	  var visitorKeys = keyMap || QueryDocumentKeys;

	  var stack = void 0;
	  var inArray = Array.isArray(root);
	  var keys = [root];
	  var index = -1;
	  var edits = [];
	  var parent = void 0;
	  var path = [];
	  var ancestors = [];
	  var newRoot = root;

	  do {
	    index++;
	    var isLeaving = index === keys.length;
	    var key = void 0;
	    var node = void 0;
	    var isEdited = isLeaving && edits.length !== 0;
	    if (isLeaving) {
	      key = ancestors.length === 0 ? undefined : path.pop();
	      node = parent;
	      parent = ancestors.pop();
	      if (isEdited) {
	        if (inArray) {
	          node = node.slice();
	        } else {
	          var clone = {};
	          for (var k in node) {
	            if (node.hasOwnProperty(k)) {
	              clone[k] = node[k];
	            }
	          }
	          node = clone;
	        }
	        var editOffset = 0;
	        for (var ii = 0; ii < edits.length; ii++) {
	          var editKey = edits[ii][0];
	          var editValue = edits[ii][1];
	          if (inArray) {
	            editKey -= editOffset;
	          }
	          if (inArray && editValue === null) {
	            node.splice(editKey, 1);
	            editOffset++;
	          } else {
	            node[editKey] = editValue;
	          }
	        }
	      }
	      index = stack.index;
	      keys = stack.keys;
	      edits = stack.edits;
	      inArray = stack.inArray;
	      stack = stack.prev;
	    } else {
	      key = parent ? inArray ? index : keys[index] : undefined;
	      node = parent ? parent[key] : newRoot;
	      if (node === null || node === undefined) {
	        continue;
	      }
	      if (parent) {
	        path.push(key);
	      }
	    }

	    var result = void 0;
	    if (!Array.isArray(node)) {
	      if (!isNode(node)) {
	        throw new Error('Invalid AST Node: ' + JSON.stringify(node));
	      }
	      var visitFn = getVisitFn(visitor, node.kind, isLeaving);
	      if (visitFn) {
	        result = visitFn.call(visitor, node, key, parent, path, ancestors);

	        if (result === BREAK) {
	          break;
	        }

	        if (result === false) {
	          if (!isLeaving) {
	            path.pop();
	            continue;
	          }
	        } else if (result !== undefined) {
	          edits.push([key, result]);
	          if (!isLeaving) {
	            if (isNode(result)) {
	              node = result;
	            } else {
	              path.pop();
	              continue;
	            }
	          }
	        }
	      }
	    }

	    if (result === undefined && isEdited) {
	      edits.push([key, node]);
	    }

	    if (!isLeaving) {
	      stack = { inArray: inArray, index: index, keys: keys, edits: edits, prev: stack };
	      inArray = Array.isArray(node);
	      keys = inArray ? node : visitorKeys[node.kind] || [];
	      index = -1;
	      edits = [];
	      if (parent) {
	        ancestors.push(parent);
	      }
	      parent = node;
	    }
	  } while (stack !== undefined);

	  if (edits.length !== 0) {
	    newRoot = edits[edits.length - 1][1];
	  }

	  return newRoot;
	}

	function isNode(maybeNode) {
	  return maybeNode && typeof maybeNode.kind === 'string';
	}

	/**
	 * Creates a new visitor instance which delegates to many visitors to run in
	 * parallel. Each visitor will be visited for each node before moving on.
	 *
	 * If a prior visitor edits a node, no following visitors will see that node.
	 */
	function visitInParallel(visitors) {
	  var skipping = new Array(visitors.length);

	  return {
	    enter: function enter(node) {
	      for (var i = 0; i < visitors.length; i++) {
	        if (!skipping[i]) {
	          var fn = getVisitFn(visitors[i], node.kind, /* isLeaving */false);
	          if (fn) {
	            var result = fn.apply(visitors[i], arguments);
	            if (result === false) {
	              skipping[i] = node;
	            } else if (result === BREAK) {
	              skipping[i] = BREAK;
	            } else if (result !== undefined) {
	              return result;
	            }
	          }
	        }
	      }
	    },
	    leave: function leave(node) {
	      for (var i = 0; i < visitors.length; i++) {
	        if (!skipping[i]) {
	          var fn = getVisitFn(visitors[i], node.kind, /* isLeaving */true);
	          if (fn) {
	            var result = fn.apply(visitors[i], arguments);
	            if (result === BREAK) {
	              skipping[i] = BREAK;
	            } else if (result !== undefined && result !== false) {
	              return result;
	            }
	          }
	        } else if (skipping[i] === node) {
	          skipping[i] = null;
	        }
	      }
	    }
	  };
	}

	/**
	 * Creates a new visitor instance which maintains a provided TypeInfo instance
	 * along with visiting visitor.
	 */
	function visitWithTypeInfo(typeInfo, visitor) {
	  return {
	    enter: function enter(node) {
	      typeInfo.enter(node);
	      var fn = getVisitFn(visitor, node.kind, /* isLeaving */false);
	      if (fn) {
	        var result = fn.apply(visitor, arguments);
	        if (result !== undefined) {
	          typeInfo.leave(node);
	          if (isNode(result)) {
	            typeInfo.enter(result);
	          }
	        }
	        return result;
	      }
	    },
	    leave: function leave(node) {
	      var fn = getVisitFn(visitor, node.kind, /* isLeaving */true);
	      var result = void 0;
	      if (fn) {
	        result = fn.apply(visitor, arguments);
	      }
	      typeInfo.leave(node);
	      return result;
	    }
	  };
	}

	/**
	 * Given a visitor instance, if it is leaving or not, and a node kind, return
	 * the function the visitor runtime should call.
	 */
	function getVisitFn(visitor, kind, isLeaving) {
	  var kindVisitor = visitor[kind];
	  if (kindVisitor) {
	    if (!isLeaving && typeof kindVisitor === 'function') {
	      // { Kind() {} }
	      return kindVisitor;
	    }
	    var kindSpecificVisitor = isLeaving ? kindVisitor.leave : kindVisitor.enter;
	    if (typeof kindSpecificVisitor === 'function') {
	      // { Kind: { enter() {}, leave() {} } }
	      return kindSpecificVisitor;
	    }
	  } else {
	    var specificVisitor = isLeaving ? visitor.leave : visitor.enter;
	    if (specificVisitor) {
	      if (typeof specificVisitor === 'function') {
	        // { enter() {}, leave() {} }
	        return specificVisitor;
	      }
	      var specificKindVisitor = specificVisitor[kind];
	      if (typeof specificKindVisitor === 'function') {
	        // { enter: { Kind() {} }, leave: { Kind() {} } }
	        return specificKindVisitor;
	      }
	    }
	  }
	}

/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.parse = parse;
	exports.parseValue = parseValue;
	exports.parseType = parseType;
	exports.parseConstValue = parseConstValue;
	exports.parseTypeReference = parseTypeReference;
	exports.parseNamedType = parseNamedType;

	var _source = __webpack_require__(13);

	var _error = __webpack_require__(15);

	var _lexer = __webpack_require__(21);

	var _kinds = __webpack_require__(22);

	/**
	 * Given a GraphQL source, parses it into a Document.
	 * Throws GraphQLError if a syntax error is encountered.
	 */


	/**
	 * Configuration options to control parser behavior
	 */
	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 *
	 * 
	 */

	function parse(source, options) {
	  var sourceObj = typeof source === 'string' ? new _source.Source(source) : source;
	  if (!(sourceObj instanceof _source.Source)) {
	    throw new TypeError('Must provide Source. Received: ' + String(sourceObj));
	  }
	  var lexer = (0, _lexer.createLexer)(sourceObj, options || {});
	  return parseDocument(lexer);
	}

	/**
	 * Given a string containing a GraphQL value (ex. `[42]`), parse the AST for
	 * that value.
	 * Throws GraphQLError if a syntax error is encountered.
	 *
	 * This is useful within tools that operate upon GraphQL Values directly and
	 * in isolation of complete GraphQL documents.
	 *
	 * Consider providing the results to the utility function: valueFromAST().
	 */
	function parseValue(source, options) {
	  var sourceObj = typeof source === 'string' ? new _source.Source(source) : source;
	  var lexer = (0, _lexer.createLexer)(sourceObj, options || {});
	  expect(lexer, _lexer.TokenKind.SOF);
	  var value = parseValueLiteral(lexer, false);
	  expect(lexer, _lexer.TokenKind.EOF);
	  return value;
	}

	/**
	 * Given a string containing a GraphQL Type (ex. `[Int!]`), parse the AST for
	 * that type.
	 * Throws GraphQLError if a syntax error is encountered.
	 *
	 * This is useful within tools that operate upon GraphQL Types directly and
	 * in isolation of complete GraphQL documents.
	 *
	 * Consider providing the results to the utility function: typeFromAST().
	 */
	function parseType(source, options) {
	  var sourceObj = typeof source === 'string' ? new _source.Source(source) : source;
	  var lexer = (0, _lexer.createLexer)(sourceObj, options || {});
	  expect(lexer, _lexer.TokenKind.SOF);
	  var type = parseTypeReference(lexer);
	  expect(lexer, _lexer.TokenKind.EOF);
	  return type;
	}

	/**
	 * Converts a name lex token into a name parse node.
	 */
	function parseName(lexer) {
	  var token = expect(lexer, _lexer.TokenKind.NAME);
	  return {
	    kind: _kinds.NAME,
	    value: token.value,
	    loc: loc(lexer, token)
	  };
	}

	// Implements the parsing rules in the Document section.

	/**
	 * Document : Definition+
	 */
	function parseDocument(lexer) {
	  var start = lexer.token;
	  expect(lexer, _lexer.TokenKind.SOF);
	  var definitions = [];
	  do {
	    definitions.push(parseDefinition(lexer));
	  } while (!skip(lexer, _lexer.TokenKind.EOF));

	  return {
	    kind: _kinds.DOCUMENT,
	    definitions: definitions,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * Definition :
	 *   - OperationDefinition
	 *   - FragmentDefinition
	 *   - TypeSystemDefinition
	 */
	function parseDefinition(lexer) {
	  if (peek(lexer, _lexer.TokenKind.BRACE_L)) {
	    return parseOperationDefinition(lexer);
	  }

	  if (peek(lexer, _lexer.TokenKind.NAME)) {
	    switch (lexer.token.value) {
	      // Note: subscription is an experimental non-spec addition.
	      case 'query':
	      case 'mutation':
	      case 'subscription':
	        return parseOperationDefinition(lexer);

	      case 'fragment':
	        return parseFragmentDefinition(lexer);

	      // Note: the Type System IDL is an experimental non-spec addition.
	      case 'schema':
	      case 'scalar':
	      case 'type':
	      case 'interface':
	      case 'union':
	      case 'enum':
	      case 'input':
	      case 'extend':
	      case 'directive':
	        return parseTypeSystemDefinition(lexer);
	    }
	  }

	  throw unexpected(lexer);
	}

	// Implements the parsing rules in the Operations section.

	/**
	 * OperationDefinition :
	 *  - SelectionSet
	 *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
	 */
	function parseOperationDefinition(lexer) {
	  var start = lexer.token;
	  if (peek(lexer, _lexer.TokenKind.BRACE_L)) {
	    return {
	      kind: _kinds.OPERATION_DEFINITION,
	      operation: 'query',
	      name: null,
	      variableDefinitions: null,
	      directives: [],
	      selectionSet: parseSelectionSet(lexer),
	      loc: loc(lexer, start)
	    };
	  }
	  var operation = parseOperationType(lexer);
	  var name = void 0;
	  if (peek(lexer, _lexer.TokenKind.NAME)) {
	    name = parseName(lexer);
	  }
	  return {
	    kind: _kinds.OPERATION_DEFINITION,
	    operation: operation,
	    name: name,
	    variableDefinitions: parseVariableDefinitions(lexer),
	    directives: parseDirectives(lexer),
	    selectionSet: parseSelectionSet(lexer),
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * OperationType : one of query mutation subscription
	 */
	function parseOperationType(lexer) {
	  var operationToken = expect(lexer, _lexer.TokenKind.NAME);
	  switch (operationToken.value) {
	    case 'query':
	      return 'query';
	    case 'mutation':
	      return 'mutation';
	    // Note: subscription is an experimental non-spec addition.
	    case 'subscription':
	      return 'subscription';
	  }

	  throw unexpected(lexer, operationToken);
	}

	/**
	 * VariableDefinitions : ( VariableDefinition+ )
	 */
	function parseVariableDefinitions(lexer) {
	  return peek(lexer, _lexer.TokenKind.PAREN_L) ? many(lexer, _lexer.TokenKind.PAREN_L, parseVariableDefinition, _lexer.TokenKind.PAREN_R) : [];
	}

	/**
	 * VariableDefinition : Variable : Type DefaultValue?
	 */
	function parseVariableDefinition(lexer) {
	  var start = lexer.token;
	  return {
	    kind: _kinds.VARIABLE_DEFINITION,
	    variable: parseVariable(lexer),
	    type: (expect(lexer, _lexer.TokenKind.COLON), parseTypeReference(lexer)),
	    defaultValue: skip(lexer, _lexer.TokenKind.EQUALS) ? parseValueLiteral(lexer, true) : null,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * Variable : $ Name
	 */
	function parseVariable(lexer) {
	  var start = lexer.token;
	  expect(lexer, _lexer.TokenKind.DOLLAR);
	  return {
	    kind: _kinds.VARIABLE,
	    name: parseName(lexer),
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * SelectionSet : { Selection+ }
	 */
	function parseSelectionSet(lexer) {
	  var start = lexer.token;
	  return {
	    kind: _kinds.SELECTION_SET,
	    selections: many(lexer, _lexer.TokenKind.BRACE_L, parseSelection, _lexer.TokenKind.BRACE_R),
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * Selection :
	 *   - Field
	 *   - FragmentSpread
	 *   - InlineFragment
	 */
	function parseSelection(lexer) {
	  return peek(lexer, _lexer.TokenKind.SPREAD) ? parseFragment(lexer) : parseField(lexer);
	}

	/**
	 * Field : Alias? Name Arguments? Directives? SelectionSet?
	 *
	 * Alias : Name :
	 */
	function parseField(lexer) {
	  var start = lexer.token;

	  var nameOrAlias = parseName(lexer);
	  var alias = void 0;
	  var name = void 0;
	  if (skip(lexer, _lexer.TokenKind.COLON)) {
	    alias = nameOrAlias;
	    name = parseName(lexer);
	  } else {
	    alias = null;
	    name = nameOrAlias;
	  }

	  return {
	    kind: _kinds.FIELD,
	    alias: alias,
	    name: name,
	    arguments: parseArguments(lexer),
	    directives: parseDirectives(lexer),
	    selectionSet: peek(lexer, _lexer.TokenKind.BRACE_L) ? parseSelectionSet(lexer) : null,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * Arguments : ( Argument+ )
	 */
	function parseArguments(lexer) {
	  return peek(lexer, _lexer.TokenKind.PAREN_L) ? many(lexer, _lexer.TokenKind.PAREN_L, parseArgument, _lexer.TokenKind.PAREN_R) : [];
	}

	/**
	 * Argument : Name : Value
	 */
	function parseArgument(lexer) {
	  var start = lexer.token;
	  return {
	    kind: _kinds.ARGUMENT,
	    name: parseName(lexer),
	    value: (expect(lexer, _lexer.TokenKind.COLON), parseValueLiteral(lexer, false)),
	    loc: loc(lexer, start)
	  };
	}

	// Implements the parsing rules in the Fragments section.

	/**
	 * Corresponds to both FragmentSpread and InlineFragment in the spec.
	 *
	 * FragmentSpread : ... FragmentName Directives?
	 *
	 * InlineFragment : ... TypeCondition? Directives? SelectionSet
	 */
	function parseFragment(lexer) {
	  var start = lexer.token;
	  expect(lexer, _lexer.TokenKind.SPREAD);
	  if (peek(lexer, _lexer.TokenKind.NAME) && lexer.token.value !== 'on') {
	    return {
	      kind: _kinds.FRAGMENT_SPREAD,
	      name: parseFragmentName(lexer),
	      directives: parseDirectives(lexer),
	      loc: loc(lexer, start)
	    };
	  }
	  var typeCondition = null;
	  if (lexer.token.value === 'on') {
	    lexer.advance();
	    typeCondition = parseNamedType(lexer);
	  }
	  return {
	    kind: _kinds.INLINE_FRAGMENT,
	    typeCondition: typeCondition,
	    directives: parseDirectives(lexer),
	    selectionSet: parseSelectionSet(lexer),
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * FragmentDefinition :
	 *   - fragment FragmentName on TypeCondition Directives? SelectionSet
	 *
	 * TypeCondition : NamedType
	 */
	function parseFragmentDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'fragment');
	  return {
	    kind: _kinds.FRAGMENT_DEFINITION,
	    name: parseFragmentName(lexer),
	    typeCondition: (expectKeyword(lexer, 'on'), parseNamedType(lexer)),
	    directives: parseDirectives(lexer),
	    selectionSet: parseSelectionSet(lexer),
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * FragmentName : Name but not `on`
	 */
	function parseFragmentName(lexer) {
	  if (lexer.token.value === 'on') {
	    throw unexpected(lexer);
	  }
	  return parseName(lexer);
	}

	// Implements the parsing rules in the Values section.

	/**
	 * Value[Const] :
	 *   - [~Const] Variable
	 *   - IntValue
	 *   - FloatValue
	 *   - StringValue
	 *   - BooleanValue
	 *   - NullValue
	 *   - EnumValue
	 *   - ListValue[?Const]
	 *   - ObjectValue[?Const]
	 *
	 * BooleanValue : one of `true` `false`
	 *
	 * NullValue : `null`
	 *
	 * EnumValue : Name but not `true`, `false` or `null`
	 */
	function parseValueLiteral(lexer, isConst) {
	  var token = lexer.token;
	  switch (token.kind) {
	    case _lexer.TokenKind.BRACKET_L:
	      return parseList(lexer, isConst);
	    case _lexer.TokenKind.BRACE_L:
	      return parseObject(lexer, isConst);
	    case _lexer.TokenKind.INT:
	      lexer.advance();
	      return {
	        kind: _kinds.INT,
	        value: token.value,
	        loc: loc(lexer, token)
	      };
	    case _lexer.TokenKind.FLOAT:
	      lexer.advance();
	      return {
	        kind: _kinds.FLOAT,
	        value: token.value,
	        loc: loc(lexer, token)
	      };
	    case _lexer.TokenKind.STRING:
	      lexer.advance();
	      return {
	        kind: _kinds.STRING,
	        value: token.value,
	        loc: loc(lexer, token)
	      };
	    case _lexer.TokenKind.NAME:
	      if (token.value === 'true' || token.value === 'false') {
	        lexer.advance();
	        return {
	          kind: _kinds.BOOLEAN,
	          value: token.value === 'true',
	          loc: loc(lexer, token)
	        };
	      } else if (token.value === 'null') {
	        lexer.advance();
	        return {
	          kind: _kinds.NULL,
	          loc: loc(lexer, token)
	        };
	      }
	      lexer.advance();
	      return {
	        kind: _kinds.ENUM,
	        value: token.value,
	        loc: loc(lexer, token)
	      };
	    case _lexer.TokenKind.DOLLAR:
	      if (!isConst) {
	        return parseVariable(lexer);
	      }
	      break;
	  }
	  throw unexpected(lexer);
	}

	function parseConstValue(lexer) {
	  return parseValueLiteral(lexer, true);
	}

	function parseValueValue(lexer) {
	  return parseValueLiteral(lexer, false);
	}

	/**
	 * ListValue[Const] :
	 *   - [ ]
	 *   - [ Value[?Const]+ ]
	 */
	function parseList(lexer, isConst) {
	  var start = lexer.token;
	  var item = isConst ? parseConstValue : parseValueValue;
	  return {
	    kind: _kinds.LIST,
	    values: any(lexer, _lexer.TokenKind.BRACKET_L, item, _lexer.TokenKind.BRACKET_R),
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * ObjectValue[Const] :
	 *   - { }
	 *   - { ObjectField[?Const]+ }
	 */
	function parseObject(lexer, isConst) {
	  var start = lexer.token;
	  expect(lexer, _lexer.TokenKind.BRACE_L);
	  var fields = [];
	  while (!skip(lexer, _lexer.TokenKind.BRACE_R)) {
	    fields.push(parseObjectField(lexer, isConst));
	  }
	  return {
	    kind: _kinds.OBJECT,
	    fields: fields,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * ObjectField[Const] : Name : Value[?Const]
	 */
	function parseObjectField(lexer, isConst) {
	  var start = lexer.token;
	  return {
	    kind: _kinds.OBJECT_FIELD,
	    name: parseName(lexer),
	    value: (expect(lexer, _lexer.TokenKind.COLON), parseValueLiteral(lexer, isConst)),
	    loc: loc(lexer, start)
	  };
	}

	// Implements the parsing rules in the Directives section.

	/**
	 * Directives : Directive+
	 */
	function parseDirectives(lexer) {
	  var directives = [];
	  while (peek(lexer, _lexer.TokenKind.AT)) {
	    directives.push(parseDirective(lexer));
	  }
	  return directives;
	}

	/**
	 * Directive : @ Name Arguments?
	 */
	function parseDirective(lexer) {
	  var start = lexer.token;
	  expect(lexer, _lexer.TokenKind.AT);
	  return {
	    kind: _kinds.DIRECTIVE,
	    name: parseName(lexer),
	    arguments: parseArguments(lexer),
	    loc: loc(lexer, start)
	  };
	}

	// Implements the parsing rules in the Types section.

	/**
	 * Type :
	 *   - NamedType
	 *   - ListType
	 *   - NonNullType
	 */
	function parseTypeReference(lexer) {
	  var start = lexer.token;
	  var type = void 0;
	  if (skip(lexer, _lexer.TokenKind.BRACKET_L)) {
	    type = parseTypeReference(lexer);
	    expect(lexer, _lexer.TokenKind.BRACKET_R);
	    type = {
	      kind: _kinds.LIST_TYPE,
	      type: type,
	      loc: loc(lexer, start)
	    };
	  } else {
	    type = parseNamedType(lexer);
	  }
	  if (skip(lexer, _lexer.TokenKind.BANG)) {
	    return {
	      kind: _kinds.NON_NULL_TYPE,
	      type: type,
	      loc: loc(lexer, start)
	    };
	  }
	  return type;
	}

	/**
	 * NamedType : Name
	 */
	function parseNamedType(lexer) {
	  var start = lexer.token;
	  return {
	    kind: _kinds.NAMED_TYPE,
	    name: parseName(lexer),
	    loc: loc(lexer, start)
	  };
	}

	// Implements the parsing rules in the Type Definition section.

	/**
	 * TypeSystemDefinition :
	 *   - SchemaDefinition
	 *   - TypeDefinition
	 *   - TypeExtensionDefinition
	 *   - DirectiveDefinition
	 *
	 * TypeDefinition :
	 *   - ScalarTypeDefinition
	 *   - ObjectTypeDefinition
	 *   - InterfaceTypeDefinition
	 *   - UnionTypeDefinition
	 *   - EnumTypeDefinition
	 *   - InputObjectTypeDefinition
	 */
	function parseTypeSystemDefinition(lexer) {
	  if (peek(lexer, _lexer.TokenKind.NAME)) {
	    switch (lexer.token.value) {
	      case 'schema':
	        return parseSchemaDefinition(lexer);
	      case 'scalar':
	        return parseScalarTypeDefinition(lexer);
	      case 'type':
	        return parseObjectTypeDefinition(lexer);
	      case 'interface':
	        return parseInterfaceTypeDefinition(lexer);
	      case 'union':
	        return parseUnionTypeDefinition(lexer);
	      case 'enum':
	        return parseEnumTypeDefinition(lexer);
	      case 'input':
	        return parseInputObjectTypeDefinition(lexer);
	      case 'extend':
	        return parseTypeExtensionDefinition(lexer);
	      case 'directive':
	        return parseDirectiveDefinition(lexer);
	    }
	  }

	  throw unexpected(lexer);
	}

	/**
	 * SchemaDefinition : schema Directives? { OperationTypeDefinition+ }
	 *
	 * OperationTypeDefinition : OperationType : NamedType
	 */
	function parseSchemaDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'schema');
	  var directives = parseDirectives(lexer);
	  var operationTypes = many(lexer, _lexer.TokenKind.BRACE_L, parseOperationTypeDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.SCHEMA_DEFINITION,
	    directives: directives,
	    operationTypes: operationTypes,
	    loc: loc(lexer, start)
	  };
	}

	function parseOperationTypeDefinition(lexer) {
	  var start = lexer.token;
	  var operation = parseOperationType(lexer);
	  expect(lexer, _lexer.TokenKind.COLON);
	  var type = parseNamedType(lexer);
	  return {
	    kind: _kinds.OPERATION_TYPE_DEFINITION,
	    operation: operation,
	    type: type,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * ScalarTypeDefinition : scalar Name Directives?
	 */
	function parseScalarTypeDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'scalar');
	  var name = parseName(lexer);
	  var directives = parseDirectives(lexer);
	  return {
	    kind: _kinds.SCALAR_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * ObjectTypeDefinition :
	 *   - type Name ImplementsInterfaces? Directives? { FieldDefinition+ }
	 */
	function parseObjectTypeDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'type');
	  var name = parseName(lexer);
	  var interfaces = parseImplementsInterfaces(lexer);
	  var directives = parseDirectives(lexer);
	  var fields = any(lexer, _lexer.TokenKind.BRACE_L, parseFieldDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.OBJECT_TYPE_DEFINITION,
	    name: name,
	    interfaces: interfaces,
	    directives: directives,
	    fields: fields,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * ImplementsInterfaces : implements NamedType+
	 */
	function parseImplementsInterfaces(lexer) {
	  var types = [];
	  if (lexer.token.value === 'implements') {
	    lexer.advance();
	    do {
	      types.push(parseNamedType(lexer));
	    } while (peek(lexer, _lexer.TokenKind.NAME));
	  }
	  return types;
	}

	/**
	 * FieldDefinition : Name ArgumentsDefinition? : Type Directives?
	 */
	function parseFieldDefinition(lexer) {
	  var start = lexer.token;
	  var name = parseName(lexer);
	  var args = parseArgumentDefs(lexer);
	  expect(lexer, _lexer.TokenKind.COLON);
	  var type = parseTypeReference(lexer);
	  var directives = parseDirectives(lexer);
	  return {
	    kind: _kinds.FIELD_DEFINITION,
	    name: name,
	    arguments: args,
	    type: type,
	    directives: directives,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * ArgumentsDefinition : ( InputValueDefinition+ )
	 */
	function parseArgumentDefs(lexer) {
	  if (!peek(lexer, _lexer.TokenKind.PAREN_L)) {
	    return [];
	  }
	  return many(lexer, _lexer.TokenKind.PAREN_L, parseInputValueDef, _lexer.TokenKind.PAREN_R);
	}

	/**
	 * InputValueDefinition : Name : Type DefaultValue? Directives?
	 */
	function parseInputValueDef(lexer) {
	  var start = lexer.token;
	  var name = parseName(lexer);
	  expect(lexer, _lexer.TokenKind.COLON);
	  var type = parseTypeReference(lexer);
	  var defaultValue = null;
	  if (skip(lexer, _lexer.TokenKind.EQUALS)) {
	    defaultValue = parseConstValue(lexer);
	  }
	  var directives = parseDirectives(lexer);
	  return {
	    kind: _kinds.INPUT_VALUE_DEFINITION,
	    name: name,
	    type: type,
	    defaultValue: defaultValue,
	    directives: directives,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * InterfaceTypeDefinition : interface Name Directives? { FieldDefinition+ }
	 */
	function parseInterfaceTypeDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'interface');
	  var name = parseName(lexer);
	  var directives = parseDirectives(lexer);
	  var fields = any(lexer, _lexer.TokenKind.BRACE_L, parseFieldDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.INTERFACE_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    fields: fields,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * UnionTypeDefinition : union Name Directives? = UnionMembers
	 */
	function parseUnionTypeDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'union');
	  var name = parseName(lexer);
	  var directives = parseDirectives(lexer);
	  expect(lexer, _lexer.TokenKind.EQUALS);
	  var types = parseUnionMembers(lexer);
	  return {
	    kind: _kinds.UNION_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    types: types,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * UnionMembers :
	 *   - `|`? NamedType
	 *   - UnionMembers | NamedType
	 */
	function parseUnionMembers(lexer) {
	  // Optional leading pipe
	  skip(lexer, _lexer.TokenKind.PIPE);
	  var members = [];
	  do {
	    members.push(parseNamedType(lexer));
	  } while (skip(lexer, _lexer.TokenKind.PIPE));
	  return members;
	}

	/**
	 * EnumTypeDefinition : enum Name Directives? { EnumValueDefinition+ }
	 */
	function parseEnumTypeDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'enum');
	  var name = parseName(lexer);
	  var directives = parseDirectives(lexer);
	  var values = many(lexer, _lexer.TokenKind.BRACE_L, parseEnumValueDefinition, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.ENUM_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    values: values,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * EnumValueDefinition : EnumValue Directives?
	 *
	 * EnumValue : Name
	 */
	function parseEnumValueDefinition(lexer) {
	  var start = lexer.token;
	  var name = parseName(lexer);
	  var directives = parseDirectives(lexer);
	  return {
	    kind: _kinds.ENUM_VALUE_DEFINITION,
	    name: name,
	    directives: directives,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * InputObjectTypeDefinition : input Name Directives? { InputValueDefinition+ }
	 */
	function parseInputObjectTypeDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'input');
	  var name = parseName(lexer);
	  var directives = parseDirectives(lexer);
	  var fields = any(lexer, _lexer.TokenKind.BRACE_L, parseInputValueDef, _lexer.TokenKind.BRACE_R);
	  return {
	    kind: _kinds.INPUT_OBJECT_TYPE_DEFINITION,
	    name: name,
	    directives: directives,
	    fields: fields,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * TypeExtensionDefinition : extend ObjectTypeDefinition
	 */
	function parseTypeExtensionDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'extend');
	  var definition = parseObjectTypeDefinition(lexer);
	  return {
	    kind: _kinds.TYPE_EXTENSION_DEFINITION,
	    definition: definition,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * DirectiveDefinition :
	 *   - directive @ Name ArgumentsDefinition? on DirectiveLocations
	 */
	function parseDirectiveDefinition(lexer) {
	  var start = lexer.token;
	  expectKeyword(lexer, 'directive');
	  expect(lexer, _lexer.TokenKind.AT);
	  var name = parseName(lexer);
	  var args = parseArgumentDefs(lexer);
	  expectKeyword(lexer, 'on');
	  var locations = parseDirectiveLocations(lexer);
	  return {
	    kind: _kinds.DIRECTIVE_DEFINITION,
	    name: name,
	    arguments: args,
	    locations: locations,
	    loc: loc(lexer, start)
	  };
	}

	/**
	 * DirectiveLocations :
	 *   - `|`? Name
	 *   - DirectiveLocations | Name
	 */
	function parseDirectiveLocations(lexer) {
	  // Optional leading pipe
	  skip(lexer, _lexer.TokenKind.PIPE);
	  var locations = [];
	  do {
	    locations.push(parseName(lexer));
	  } while (skip(lexer, _lexer.TokenKind.PIPE));
	  return locations;
	}

	// Core parsing utility functions

	/**
	 * Returns a location object, used to identify the place in
	 * the source that created a given parsed object.
	 */
	function loc(lexer, startToken) {
	  if (!lexer.options.noLocation) {
	    return new Loc(startToken, lexer.lastToken, lexer.source);
	  }
	}

	function Loc(startToken, endToken, source) {
	  this.start = startToken.start;
	  this.end = endToken.end;
	  this.startToken = startToken;
	  this.endToken = endToken;
	  this.source = source;
	}

	// Print a simplified form when appearing in JSON/util.inspect.
	Loc.prototype.toJSON = Loc.prototype.inspect = function toJSON() {
	  return { start: this.start, end: this.end };
	};

	/**
	 * Determines if the next token is of a given kind
	 */
	function peek(lexer, kind) {
	  return lexer.token.kind === kind;
	}

	/**
	 * If the next token is of the given kind, return true after advancing
	 * the lexer. Otherwise, do not change the parser state and return false.
	 */
	function skip(lexer, kind) {
	  var match = lexer.token.kind === kind;
	  if (match) {
	    lexer.advance();
	  }
	  return match;
	}

	/**
	 * If the next token is of the given kind, return that token after advancing
	 * the lexer. Otherwise, do not change the parser state and throw an error.
	 */
	function expect(lexer, kind) {
	  var token = lexer.token;
	  if (token.kind === kind) {
	    lexer.advance();
	    return token;
	  }
	  throw (0, _error.syntaxError)(lexer.source, token.start, 'Expected ' + kind + ', found ' + (0, _lexer.getTokenDesc)(token));
	}

	/**
	 * If the next token is a keyword with the given value, return that token after
	 * advancing the lexer. Otherwise, do not change the parser state and return
	 * false.
	 */
	function expectKeyword(lexer, value) {
	  var token = lexer.token;
	  if (token.kind === _lexer.TokenKind.NAME && token.value === value) {
	    lexer.advance();
	    return token;
	  }
	  throw (0, _error.syntaxError)(lexer.source, token.start, 'Expected "' + value + '", found ' + (0, _lexer.getTokenDesc)(token));
	}

	/**
	 * Helper function for creating an error when an unexpected lexed token
	 * is encountered.
	 */
	function unexpected(lexer, atToken) {
	  var token = atToken || lexer.token;
	  return (0, _error.syntaxError)(lexer.source, token.start, 'Unexpected ' + (0, _lexer.getTokenDesc)(token));
	}

	/**
	 * Returns a possibly empty list of parse nodes, determined by
	 * the parseFn. This list begins with a lex token of openKind
	 * and ends with a lex token of closeKind. Advances the parser
	 * to the next lex token after the closing token.
	 */
	function any(lexer, openKind, parseFn, closeKind) {
	  expect(lexer, openKind);
	  var nodes = [];
	  while (!skip(lexer, closeKind)) {
	    nodes.push(parseFn(lexer));
	  }
	  return nodes;
	}

	/**
	 * Returns a non-empty list of parse nodes, determined by
	 * the parseFn. This list begins with a lex token of openKind
	 * and ends with a lex token of closeKind. Advances the parser
	 * to the next lex token after the closing token.
	 */
	function many(lexer, openKind, parseFn, closeKind) {
	  expect(lexer, openKind);
	  var nodes = [parseFn(lexer)];
	  while (!skip(lexer, closeKind)) {
	    nodes.push(parseFn(lexer));
	  }
	  return nodes;
	}

/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Source = undefined;

	var _invariant = __webpack_require__(14);

	var _invariant2 = _interopRequireDefault(_invariant);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
	                                                                                                                                                           * Copyright (c) 2015-present, Facebook, Inc.
	                                                                                                                                                           *
	                                                                                                                                                           * This source code is licensed under the MIT license found in the
	                                                                                                                                                           * LICENSE file in the root directory of this source tree.
	                                                                                                                                                           *
	                                                                                                                                                           * 
	                                                                                                                                                           */

	/**
	 * A representation of source input to GraphQL.
	 * `name` and `locationOffset` are optional. They are useful for clients who
	 * store GraphQL documents in source files; for example, if the GraphQL input
	 * starts at line 40 in a file named Foo.graphql, it might be useful for name to
	 * be "Foo.graphql" and location to be `{ line: 40, column: 0 }`.
	 * line and column in locationOffset are 1-indexed
	 */
	var Source = exports.Source = function Source(body, name, locationOffset) {
	  _classCallCheck(this, Source);

	  this.body = body;
	  this.name = name || 'GraphQL request';
	  this.locationOffset = locationOffset || { line: 1, column: 1 };
	  !(this.locationOffset.line > 0) ? (0, _invariant2.default)(0, 'line in locationOffset is 1-indexed and must be positive') : void 0;
	  !(this.locationOffset.column > 0) ? (0, _invariant2.default)(0, 'column in locationOffset is 1-indexed and must be positive') : void 0;
	};

/***/ }),

/***/ 14:
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = invariant;
	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 *
	 * 
	 */

	function invariant(condition, message) {
	  if (!condition) {
	    throw new Error(message);
	  }
	}

/***/ }),

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _GraphQLError = __webpack_require__(16);

	Object.defineProperty(exports, 'GraphQLError', {
	  enumerable: true,
	  get: function get() {
	    return _GraphQLError.GraphQLError;
	  }
	});

	var _syntaxError = __webpack_require__(18);

	Object.defineProperty(exports, 'syntaxError', {
	  enumerable: true,
	  get: function get() {
	    return _syntaxError.syntaxError;
	  }
	});

	var _locatedError = __webpack_require__(19);

	Object.defineProperty(exports, 'locatedError', {
	  enumerable: true,
	  get: function get() {
	    return _locatedError.locatedError;
	  }
	});

	var _formatError = __webpack_require__(20);

	Object.defineProperty(exports, 'formatError', {
	  enumerable: true,
	  get: function get() {
	    return _formatError.formatError;
	  }
	});

/***/ }),

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.GraphQLError = GraphQLError;

	var _location = __webpack_require__(17);

	/**
	 * A GraphQLError describes an Error found during the parse, validate, or
	 * execute phases of performing a GraphQL operation. In addition to a message
	 * and stack trace, it also includes information about the locations in a
	 * GraphQL document and/or execution result that correspond to the Error.
	 */
	function GraphQLError( // eslint-disable-line no-redeclare
	message, nodes, source, positions, path, originalError) {
	  // Compute locations in the source for the given nodes/positions.
	  var _source = source;
	  if (!_source && nodes && nodes.length > 0) {
	    var node = nodes[0];
	    _source = node && node.loc && node.loc.source;
	  }

	  var _positions = positions;
	  if (!_positions && nodes) {
	    _positions = nodes.filter(function (node) {
	      return Boolean(node.loc);
	    }).map(function (node) {
	      return node.loc.start;
	    });
	  }
	  if (_positions && _positions.length === 0) {
	    _positions = undefined;
	  }

	  var _locations = void 0;
	  var _source2 = _source; // seems here Flow need a const to resolve type.
	  if (_source2 && _positions) {
	    _locations = _positions.map(function (pos) {
	      return (0, _location.getLocation)(_source2, pos);
	    });
	  }

	  Object.defineProperties(this, {
	    message: {
	      value: message,
	      // By being enumerable, JSON.stringify will include `message` in the
	      // resulting output. This ensures that the simplest possible GraphQL
	      // service adheres to the spec.
	      enumerable: true,
	      writable: true
	    },
	    locations: {
	      // Coercing falsey values to undefined ensures they will not be included
	      // in JSON.stringify() when not provided.
	      value: _locations || undefined,
	      // By being enumerable, JSON.stringify will include `locations` in the
	      // resulting output. This ensures that the simplest possible GraphQL
	      // service adheres to the spec.
	      enumerable: true
	    },
	    path: {
	      // Coercing falsey values to undefined ensures they will not be included
	      // in JSON.stringify() when not provided.
	      value: path || undefined,
	      // By being enumerable, JSON.stringify will include `path` in the
	      // resulting output. This ensures that the simplest possible GraphQL
	      // service adheres to the spec.
	      enumerable: true
	    },
	    nodes: {
	      value: nodes || undefined
	    },
	    source: {
	      value: _source || undefined
	    },
	    positions: {
	      value: _positions || undefined
	    },
	    originalError: {
	      value: originalError
	    }
	  });

	  // Include (non-enumerable) stack trace.
	  if (originalError && originalError.stack) {
	    Object.defineProperty(this, 'stack', {
	      value: originalError.stack,
	      writable: true,
	      configurable: true
	    });
	  } else if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, GraphQLError);
	  } else {
	    Object.defineProperty(this, 'stack', {
	      value: Error().stack,
	      writable: true,
	      configurable: true
	    });
	  }
	} /**
	   * Copyright (c) 2015-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   *
	   * 
	   */

	GraphQLError.prototype = Object.create(Error.prototype, {
	  constructor: { value: GraphQLError },
	  name: { value: 'GraphQLError' }
	});

/***/ }),

/***/ 17:
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getLocation = getLocation;


	/**
	 * Takes a Source and a UTF-8 character offset, and returns the corresponding
	 * line and column as a SourceLocation.
	 */
	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 *
	 * 
	 */

	function getLocation(source, position) {
	  var lineRegexp = /\r\n|[\n\r]/g;
	  var line = 1;
	  var column = position + 1;
	  var match = void 0;
	  while ((match = lineRegexp.exec(source.body)) && match.index < position) {
	    line += 1;
	    column = position + 1 - (match.index + match[0].length);
	  }
	  return { line: line, column: column };
	}

	/**
	 * Represents a location in a Source.
	 */

/***/ }),

/***/ 18:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.syntaxError = syntaxError;

	var _location = __webpack_require__(17);

	var _GraphQLError = __webpack_require__(16);

	/**
	 * Produces a GraphQLError representing a syntax error, containing useful
	 * descriptive information about the syntax error's position in the source.
	 */
	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 *
	 * 
	 */

	function syntaxError(source, position, description) {
	  var location = (0, _location.getLocation)(source, position);
	  var line = location.line + source.locationOffset.line - 1;
	  var columnOffset = getColumnOffset(source, location);
	  var column = location.column + columnOffset;
	  var error = new _GraphQLError.GraphQLError('Syntax Error ' + source.name + ' (' + line + ':' + column + ') ' + description + '\n\n' + highlightSourceAtLocation(source, location), undefined, source, [position]);
	  return error;
	}

	/**
	 * Render a helpful description of the location of the error in the GraphQL
	 * Source document.
	 */
	function highlightSourceAtLocation(source, location) {
	  var line = location.line;
	  var lineOffset = source.locationOffset.line - 1;
	  var columnOffset = getColumnOffset(source, location);
	  var contextLine = line + lineOffset;
	  var prevLineNum = (contextLine - 1).toString();
	  var lineNum = contextLine.toString();
	  var nextLineNum = (contextLine + 1).toString();
	  var padLen = nextLineNum.length;
	  var lines = source.body.split(/\r\n|[\n\r]/g);
	  lines[0] = whitespace(source.locationOffset.column - 1) + lines[0];
	  return (line >= 2 ? lpad(padLen, prevLineNum) + ': ' + lines[line - 2] + '\n' : '') + lpad(padLen, lineNum) + ': ' + lines[line - 1] + '\n' + whitespace(2 + padLen + location.column - 1 + columnOffset) + '^\n' + (line < lines.length ? lpad(padLen, nextLineNum) + ': ' + lines[line] + '\n' : '');
	}

	function getColumnOffset(source, location) {
	  return location.line === 1 ? source.locationOffset.column - 1 : 0;
	}

	function whitespace(len) {
	  return Array(len + 1).join(' ');
	}

	function lpad(len, str) {
	  return whitespace(len - str.length) + str;
	}

/***/ }),

/***/ 19:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.locatedError = locatedError;

	var _GraphQLError = __webpack_require__(16);

	/**
	 * Given an arbitrary Error, presumably thrown while attempting to execute a
	 * GraphQL operation, produce a new GraphQLError aware of the location in the
	 * document responsible for the original Error.
	 */
	function locatedError(originalError, nodes, path) {
	  // Note: this uses a brand-check to support GraphQL errors originating from
	  // other contexts.
	  if (originalError && originalError.path) {
	    return originalError;
	  }

	  var message = originalError ? originalError.message || String(originalError) : 'An unknown error occurred.';
	  return new _GraphQLError.GraphQLError(message, originalError && originalError.nodes || nodes, originalError && originalError.source, originalError && originalError.positions, path, originalError);
	} /**
	   * Copyright (c) 2015-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   *
	   * 
	   */

/***/ }),

/***/ 20:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.formatError = formatError;

	var _invariant = __webpack_require__(14);

	var _invariant2 = _interopRequireDefault(_invariant);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Given a GraphQLError, format it according to the rules described by the
	 * Response Format, Errors section of the GraphQL Specification.
	 */
	function formatError(error) {
	  !error ? (0, _invariant2.default)(0, 'Received null or undefined error.') : void 0;
	  return {
	    message: error.message,
	    locations: error.locations,
	    path: error.path
	  };
	} /**
	   * Copyright (c) 2015-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   *
	   * 
	   */

/***/ }),

/***/ 21:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.TokenKind = undefined;
	exports.createLexer = createLexer;
	exports.getTokenDesc = getTokenDesc;

	var _error = __webpack_require__(15);

	/**
	 * Given a Source object, this returns a Lexer for that source.
	 * A Lexer is a stateful stream generator in that every time
	 * it is advanced, it returns the next token in the Source. Assuming the
	 * source lexes, the final Token emitted by the lexer will be of kind
	 * EOF, after which the lexer will repeatedly return the same EOF token
	 * whenever called.
	 */
	function createLexer(source, options) {
	  var startOfFileToken = new Tok(SOF, 0, 0, 0, 0, null);
	  var lexer = {
	    source: source,
	    options: options,
	    lastToken: startOfFileToken,
	    token: startOfFileToken,
	    line: 1,
	    lineStart: 0,
	    advance: advanceLexer
	  };
	  return lexer;
	} /**
	   * Copyright (c) 2015-present, Facebook, Inc.
	   *
	   * This source code is licensed under the MIT license found in the
	   * LICENSE file in the root directory of this source tree.
	   *
	   * 
	   */

	function advanceLexer() {
	  var token = this.lastToken = this.token;
	  if (token.kind !== EOF) {
	    do {
	      token = token.next = readToken(this, token);
	    } while (token.kind === COMMENT);
	    this.token = token;
	  }
	  return token;
	}

	/**
	 * The return type of createLexer.
	 */


	// Each kind of token.
	var SOF = '<SOF>';
	var EOF = '<EOF>';
	var BANG = '!';
	var DOLLAR = '$';
	var PAREN_L = '(';
	var PAREN_R = ')';
	var SPREAD = '...';
	var COLON = ':';
	var EQUALS = '=';
	var AT = '@';
	var BRACKET_L = '[';
	var BRACKET_R = ']';
	var BRACE_L = '{';
	var PIPE = '|';
	var BRACE_R = '}';
	var NAME = 'Name';
	var INT = 'Int';
	var FLOAT = 'Float';
	var STRING = 'String';
	var COMMENT = 'Comment';

	/**
	 * An exported enum describing the different kinds of tokens that the
	 * lexer emits.
	 */
	var TokenKind = exports.TokenKind = {
	  SOF: SOF,
	  EOF: EOF,
	  BANG: BANG,
	  DOLLAR: DOLLAR,
	  PAREN_L: PAREN_L,
	  PAREN_R: PAREN_R,
	  SPREAD: SPREAD,
	  COLON: COLON,
	  EQUALS: EQUALS,
	  AT: AT,
	  BRACKET_L: BRACKET_L,
	  BRACKET_R: BRACKET_R,
	  BRACE_L: BRACE_L,
	  PIPE: PIPE,
	  BRACE_R: BRACE_R,
	  NAME: NAME,
	  INT: INT,
	  FLOAT: FLOAT,
	  STRING: STRING,
	  COMMENT: COMMENT
	};

	/**
	 * A helper function to describe a token as a string for debugging
	 */
	function getTokenDesc(token) {
	  var value = token.value;
	  return value ? token.kind + ' "' + value + '"' : token.kind;
	}

	var charCodeAt = String.prototype.charCodeAt;
	var slice = String.prototype.slice;

	/**
	 * Helper function for constructing the Token object.
	 */
	function Tok(kind, start, end, line, column, prev, value) {
	  this.kind = kind;
	  this.start = start;
	  this.end = end;
	  this.line = line;
	  this.column = column;
	  this.value = value;
	  this.prev = prev;
	  this.next = null;
	}

	// Print a simplified form when appearing in JSON/util.inspect.
	Tok.prototype.toJSON = Tok.prototype.inspect = function toJSON() {
	  return {
	    kind: this.kind,
	    value: this.value,
	    line: this.line,
	    column: this.column
	  };
	};

	function printCharCode(code) {
	  return (
	    // NaN/undefined represents access beyond the end of the file.
	    isNaN(code) ? EOF :
	    // Trust JSON for ASCII.
	    code < 0x007F ? JSON.stringify(String.fromCharCode(code)) :
	    // Otherwise print the escaped form.
	    '"\\u' + ('00' + code.toString(16).toUpperCase()).slice(-4) + '"'
	  );
	}

	/**
	 * Gets the next token from the source starting at the given position.
	 *
	 * This skips over whitespace and comments until it finds the next lexable
	 * token, then lexes punctuators immediately or calls the appropriate helper
	 * function for more complicated tokens.
	 */
	function readToken(lexer, prev) {
	  var source = lexer.source;
	  var body = source.body;
	  var bodyLength = body.length;

	  var position = positionAfterWhitespace(body, prev.end, lexer);
	  var line = lexer.line;
	  var col = 1 + position - lexer.lineStart;

	  if (position >= bodyLength) {
	    return new Tok(EOF, bodyLength, bodyLength, line, col, prev);
	  }

	  var code = charCodeAt.call(body, position);

	  // SourceCharacter
	  if (code < 0x0020 && code !== 0x0009 && code !== 0x000A && code !== 0x000D) {
	    throw (0, _error.syntaxError)(source, position, 'Cannot contain the invalid character ' + printCharCode(code) + '.');
	  }

	  switch (code) {
	    // !
	    case 33:
	      return new Tok(BANG, position, position + 1, line, col, prev);
	    // #
	    case 35:
	      return readComment(source, position, line, col, prev);
	    // $
	    case 36:
	      return new Tok(DOLLAR, position, position + 1, line, col, prev);
	    // (
	    case 40:
	      return new Tok(PAREN_L, position, position + 1, line, col, prev);
	    // )
	    case 41:
	      return new Tok(PAREN_R, position, position + 1, line, col, prev);
	    // .
	    case 46:
	      if (charCodeAt.call(body, position + 1) === 46 && charCodeAt.call(body, position + 2) === 46) {
	        return new Tok(SPREAD, position, position + 3, line, col, prev);
	      }
	      break;
	    // :
	    case 58:
	      return new Tok(COLON, position, position + 1, line, col, prev);
	    // =
	    case 61:
	      return new Tok(EQUALS, position, position + 1, line, col, prev);
	    // @
	    case 64:
	      return new Tok(AT, position, position + 1, line, col, prev);
	    // [
	    case 91:
	      return new Tok(BRACKET_L, position, position + 1, line, col, prev);
	    // ]
	    case 93:
	      return new Tok(BRACKET_R, position, position + 1, line, col, prev);
	    // {
	    case 123:
	      return new Tok(BRACE_L, position, position + 1, line, col, prev);
	    // |
	    case 124:
	      return new Tok(PIPE, position, position + 1, line, col, prev);
	    // }
	    case 125:
	      return new Tok(BRACE_R, position, position + 1, line, col, prev);
	    // A-Z _ a-z
	    case 65:case 66:case 67:case 68:case 69:case 70:case 71:case 72:
	    case 73:case 74:case 75:case 76:case 77:case 78:case 79:case 80:
	    case 81:case 82:case 83:case 84:case 85:case 86:case 87:case 88:
	    case 89:case 90:
	    case 95:
	    case 97:case 98:case 99:case 100:case 101:case 102:case 103:case 104:
	    case 105:case 106:case 107:case 108:case 109:case 110:case 111:
	    case 112:case 113:case 114:case 115:case 116:case 117:case 118:
	    case 119:case 120:case 121:case 122:
	      return readName(source, position, line, col, prev);
	    // - 0-9
	    case 45:
	    case 48:case 49:case 50:case 51:case 52:
	    case 53:case 54:case 55:case 56:case 57:
	      return readNumber(source, position, code, line, col, prev);
	    // "
	    case 34:
	      return readString(source, position, line, col, prev);
	  }

	  throw (0, _error.syntaxError)(source, position, unexpectedCharacterMessage(code));
	}

	/**
	 * Report a message that an unexpected character was encountered.
	 */
	function unexpectedCharacterMessage(code) {
	  if (code === 39) {
	    // '
	    return 'Unexpected single quote character (\'), did you mean to use ' + 'a double quote (")?';
	  }

	  return 'Cannot parse the unexpected character ' + printCharCode(code) + '.';
	}

	/**
	 * Reads from body starting at startPosition until it finds a non-whitespace
	 * or commented character, then returns the position of that character for
	 * lexing.
	 */
	function positionAfterWhitespace(body, startPosition, lexer) {
	  var bodyLength = body.length;
	  var position = startPosition;
	  while (position < bodyLength) {
	    var code = charCodeAt.call(body, position);
	    // tab | space | comma | BOM
	    if (code === 9 || code === 32 || code === 44 || code === 0xFEFF) {
	      ++position;
	    } else if (code === 10) {
	      // new line
	      ++position;
	      ++lexer.line;
	      lexer.lineStart = position;
	    } else if (code === 13) {
	      // carriage return
	      if (charCodeAt.call(body, position + 1) === 10) {
	        position += 2;
	      } else {
	        ++position;
	      }
	      ++lexer.line;
	      lexer.lineStart = position;
	    } else {
	      break;
	    }
	  }
	  return position;
	}

	/**
	 * Reads a comment token from the source file.
	 *
	 * #[\u0009\u0020-\uFFFF]*
	 */
	function readComment(source, start, line, col, prev) {
	  var body = source.body;
	  var code = void 0;
	  var position = start;

	  do {
	    code = charCodeAt.call(body, ++position);
	  } while (code !== null && (
	  // SourceCharacter but not LineTerminator
	  code > 0x001F || code === 0x0009));

	  return new Tok(COMMENT, start, position, line, col, prev, slice.call(body, start + 1, position));
	}

	/**
	 * Reads a number token from the source file, either a float
	 * or an int depending on whether a decimal point appears.
	 *
	 * Int:   -?(0|[1-9][0-9]*)
	 * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
	 */
	function readNumber(source, start, firstCode, line, col, prev) {
	  var body = source.body;
	  var code = firstCode;
	  var position = start;
	  var isFloat = false;

	  if (code === 45) {
	    // -
	    code = charCodeAt.call(body, ++position);
	  }

	  if (code === 48) {
	    // 0
	    code = charCodeAt.call(body, ++position);
	    if (code >= 48 && code <= 57) {
	      throw (0, _error.syntaxError)(source, position, 'Invalid number, unexpected digit after 0: ' + printCharCode(code) + '.');
	    }
	  } else {
	    position = readDigits(source, position, code);
	    code = charCodeAt.call(body, position);
	  }

	  if (code === 46) {
	    // .
	    isFloat = true;

	    code = charCodeAt.call(body, ++position);
	    position = readDigits(source, position, code);
	    code = charCodeAt.call(body, position);
	  }

	  if (code === 69 || code === 101) {
	    // E e
	    isFloat = true;

	    code = charCodeAt.call(body, ++position);
	    if (code === 43 || code === 45) {
	      // + -
	      code = charCodeAt.call(body, ++position);
	    }
	    position = readDigits(source, position, code);
	  }

	  return new Tok(isFloat ? FLOAT : INT, start, position, line, col, prev, slice.call(body, start, position));
	}

	/**
	 * Returns the new position in the source after reading digits.
	 */
	function readDigits(source, start, firstCode) {
	  var body = source.body;
	  var position = start;
	  var code = firstCode;
	  if (code >= 48 && code <= 57) {
	    // 0 - 9
	    do {
	      code = charCodeAt.call(body, ++position);
	    } while (code >= 48 && code <= 57); // 0 - 9
	    return position;
	  }
	  throw (0, _error.syntaxError)(source, position, 'Invalid number, expected digit but got: ' + printCharCode(code) + '.');
	}

	/**
	 * Reads a string token from the source file.
	 *
	 * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
	 */
	function readString(source, start, line, col, prev) {
	  var body = source.body;
	  var position = start + 1;
	  var chunkStart = position;
	  var code = 0;
	  var value = '';

	  while (position < body.length && (code = charCodeAt.call(body, position)) !== null &&
	  // not LineTerminator
	  code !== 0x000A && code !== 0x000D &&
	  // not Quote (")
	  code !== 34) {
	    // SourceCharacter
	    if (code < 0x0020 && code !== 0x0009) {
	      throw (0, _error.syntaxError)(source, position, 'Invalid character within String: ' + printCharCode(code) + '.');
	    }

	    ++position;
	    if (code === 92) {
	      // \
	      value += slice.call(body, chunkStart, position - 1);
	      code = charCodeAt.call(body, position);
	      switch (code) {
	        case 34:
	          value += '"';break;
	        case 47:
	          value += '/';break;
	        case 92:
	          value += '\\';break;
	        case 98:
	          value += '\b';break;
	        case 102:
	          value += '\f';break;
	        case 110:
	          value += '\n';break;
	        case 114:
	          value += '\r';break;
	        case 116:
	          value += '\t';break;
	        case 117:
	          // u
	          var charCode = uniCharCode(charCodeAt.call(body, position + 1), charCodeAt.call(body, position + 2), charCodeAt.call(body, position + 3), charCodeAt.call(body, position + 4));
	          if (charCode < 0) {
	            throw (0, _error.syntaxError)(source, position, 'Invalid character escape sequence: ' + ('\\u' + body.slice(position + 1, position + 5) + '.'));
	          }
	          value += String.fromCharCode(charCode);
	          position += 4;
	          break;
	        default:
	          throw (0, _error.syntaxError)(source, position, 'Invalid character escape sequence: \\' + String.fromCharCode(code) + '.');
	      }
	      ++position;
	      chunkStart = position;
	    }
	  }

	  if (code !== 34) {
	    // quote (")
	    throw (0, _error.syntaxError)(source, position, 'Unterminated string.');
	  }

	  value += slice.call(body, chunkStart, position);
	  return new Tok(STRING, start, position + 1, line, col, prev, value);
	}

	/**
	 * Converts four hexidecimal chars to the integer that the
	 * string represents. For example, uniCharCode('0','0','0','f')
	 * will return 15, and uniCharCode('0','0','f','f') returns 255.
	 *
	 * Returns a negative number on error, if a char was invalid.
	 *
	 * This is implemented by noting that char2hex() returns -1 on error,
	 * which means the result of ORing the char2hex() will also be negative.
	 */
	function uniCharCode(a, b, c, d) {
	  return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
	}

	/**
	 * Converts a hex character to its integer value.
	 * '0' becomes 0, '9' becomes 9
	 * 'A' becomes 10, 'F' becomes 15
	 * 'a' becomes 10, 'f' becomes 15
	 *
	 * Returns -1 on error.
	 */
	function char2hex(a) {
	  return a >= 48 && a <= 57 ? a - 48 : // 0-9
	  a >= 65 && a <= 70 ? a - 55 : // A-F
	  a >= 97 && a <= 102 ? a - 87 : // a-f
	  -1;
	}

	/**
	 * Reads an alphanumeric + underscore name from the source.
	 *
	 * [_A-Za-z][_0-9A-Za-z]*
	 */
	function readName(source, position, line, col, prev) {
	  var body = source.body;
	  var bodyLength = body.length;
	  var end = position + 1;
	  var code = 0;
	  while (end !== bodyLength && (code = charCodeAt.call(body, end)) !== null && (code === 95 || // _
	  code >= 48 && code <= 57 || // 0-9
	  code >= 65 && code <= 90 || // A-Z
	  code >= 97 && code <= 122 // a-z
	  )) {
	    ++end;
	  }
	  return new Tok(NAME, position, end, line, col, prev, slice.call(body, position, end));
	}

/***/ }),

/***/ 22:
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 *
	 * 
	 */

	// Name

	var NAME = exports.NAME = 'Name';

	// Document

	var DOCUMENT = exports.DOCUMENT = 'Document';
	var OPERATION_DEFINITION = exports.OPERATION_DEFINITION = 'OperationDefinition';
	var VARIABLE_DEFINITION = exports.VARIABLE_DEFINITION = 'VariableDefinition';
	var VARIABLE = exports.VARIABLE = 'Variable';
	var SELECTION_SET = exports.SELECTION_SET = 'SelectionSet';
	var FIELD = exports.FIELD = 'Field';
	var ARGUMENT = exports.ARGUMENT = 'Argument';

	// Fragments

	var FRAGMENT_SPREAD = exports.FRAGMENT_SPREAD = 'FragmentSpread';
	var INLINE_FRAGMENT = exports.INLINE_FRAGMENT = 'InlineFragment';
	var FRAGMENT_DEFINITION = exports.FRAGMENT_DEFINITION = 'FragmentDefinition';

	// Values

	var INT = exports.INT = 'IntValue';
	var FLOAT = exports.FLOAT = 'FloatValue';
	var STRING = exports.STRING = 'StringValue';
	var BOOLEAN = exports.BOOLEAN = 'BooleanValue';
	var NULL = exports.NULL = 'NullValue';
	var ENUM = exports.ENUM = 'EnumValue';
	var LIST = exports.LIST = 'ListValue';
	var OBJECT = exports.OBJECT = 'ObjectValue';
	var OBJECT_FIELD = exports.OBJECT_FIELD = 'ObjectField';

	// Directives

	var DIRECTIVE = exports.DIRECTIVE = 'Directive';

	// Types

	var NAMED_TYPE = exports.NAMED_TYPE = 'NamedType';
	var LIST_TYPE = exports.LIST_TYPE = 'ListType';
	var NON_NULL_TYPE = exports.NON_NULL_TYPE = 'NonNullType';

	// Type System Definitions

	var SCHEMA_DEFINITION = exports.SCHEMA_DEFINITION = 'SchemaDefinition';
	var OPERATION_TYPE_DEFINITION = exports.OPERATION_TYPE_DEFINITION = 'OperationTypeDefinition';

	// Type Definitions

	var SCALAR_TYPE_DEFINITION = exports.SCALAR_TYPE_DEFINITION = 'ScalarTypeDefinition';
	var OBJECT_TYPE_DEFINITION = exports.OBJECT_TYPE_DEFINITION = 'ObjectTypeDefinition';
	var FIELD_DEFINITION = exports.FIELD_DEFINITION = 'FieldDefinition';
	var INPUT_VALUE_DEFINITION = exports.INPUT_VALUE_DEFINITION = 'InputValueDefinition';
	var INTERFACE_TYPE_DEFINITION = exports.INTERFACE_TYPE_DEFINITION = 'InterfaceTypeDefinition';
	var UNION_TYPE_DEFINITION = exports.UNION_TYPE_DEFINITION = 'UnionTypeDefinition';
	var ENUM_TYPE_DEFINITION = exports.ENUM_TYPE_DEFINITION = 'EnumTypeDefinition';
	var ENUM_VALUE_DEFINITION = exports.ENUM_VALUE_DEFINITION = 'EnumValueDefinition';
	var INPUT_OBJECT_TYPE_DEFINITION = exports.INPUT_OBJECT_TYPE_DEFINITION = 'InputObjectTypeDefinition';

	// Type Extensions

	var TYPE_EXTENSION_DEFINITION = exports.TYPE_EXTENSION_DEFINITION = 'TypeExtensionDefinition';

	// Directive Definitions

	var DIRECTIVE_DEFINITION = exports.DIRECTIVE_DEFINITION = 'DirectiveDefinition';

/***/ }),

/***/ 23:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _events = __webpack_require__(24);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var Bridge = function (_EventEmitter) {
	  _inherits(Bridge, _EventEmitter);

	  function Bridge(wall) {
	    _classCallCheck(this, Bridge);

	    // Setting `this` to `self` here to fix an error in the Safari build:
	    // ReferenceError: Cannot access uninitialized variable.
	    // The error might be related to the webkit bug here:
	    // https://bugs.webkit.org/show_bug.cgi?id=171543
	    var _this = _possibleConstructorReturn(this, (Bridge.__proto__ || Object.getPrototypeOf(Bridge)).call(this));

	    var self = _this;
	    self.setMaxListeners(Infinity);
	    self.wall = wall;
	    wall.listen(function (message) {
	      if (typeof message === "string") {
	        self.emit(message);
	      } else {
	        self.emit(message.event, message.payload);
	      }
	    });
	    return _this;
	  }

	  _createClass(Bridge, [{
	    key: "send",
	    value: function send(event, payload) {
	      this.wall.send({
	        event: event,
	        payload: payload
	      });
	    }
	  }, {
	    key: "log",
	    value: function log(message) {
	      this.send("log", message);
	    }
	  }]);

	  return Bridge;
	}(_events.EventEmitter);

	exports.default = Bridge;

/***/ }),

/***/ 24:
/***/ (function(module, exports) {

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

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
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
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
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
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
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

	EventEmitter.prototype.removeAllListeners = function(type) {
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

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ }),

/***/ 359:
/***/ (function(module, exports, __webpack_require__) {

	(function (global, factory) {
		 true ? factory() :
		typeof define === 'function' && define.amd ? define(factory) :
		(factory());
	}(this, (function () { 'use strict';

	var parser = __webpack_require__(12);

	var parse = parser.parse;

	// Strip insignificant whitespace
	// Note that this could do a lot more, such as reorder fields etc.
	function normalize(string) {
	  return string.replace(/[\s,]+/g, ' ').trim();
	}

	// A map docString -> graphql document
	var docCache = {};

	// A map fragmentName -> [normalized source]
	var fragmentSourceMap = {};

	function cacheKeyFromLoc(loc) {
	  return normalize(loc.source.body.substring(loc.start, loc.end));
	}

	// For testing.
	function resetCaches() {
	  docCache = {};
	  fragmentSourceMap = {};
	}

	// Take a unstripped parsed document (query/mutation or even fragment), and
	// check all fragment definitions, checking for name->source uniqueness.
	// We also want to make sure only unique fragments exist in the document.
	var printFragmentWarnings = true;
	function processFragments(ast) {
	  var astFragmentMap = {};
	  var definitions = [];

	  for (var i = 0; i < ast.definitions.length; i++) {
	    var fragmentDefinition = ast.definitions[i];

	    if (fragmentDefinition.kind === 'FragmentDefinition') {
	      var fragmentName = fragmentDefinition.name.value;
	      var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);

	      // We know something about this fragment
	      if (fragmentSourceMap.hasOwnProperty(fragmentName) && !fragmentSourceMap[fragmentName][sourceKey]) {

	        // this is a problem because the app developer is trying to register another fragment with
	        // the same name as one previously registered. So, we tell them about it.
	        if (printFragmentWarnings) {
	          console.warn("Warning: fragment with name " + fragmentName + " already exists.\n"
	            + "graphql-tag enforces all fragment names across your application to be unique; read more about\n"
	            + "this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
	        }

	        fragmentSourceMap[fragmentName][sourceKey] = true;

	      } else if (!fragmentSourceMap.hasOwnProperty(fragmentName)) {
	        fragmentSourceMap[fragmentName] = {};
	        fragmentSourceMap[fragmentName][sourceKey] = true;
	      }

	      if (!astFragmentMap[sourceKey]) {
	        astFragmentMap[sourceKey] = true;
	        definitions.push(fragmentDefinition);
	      }
	    } else {
	      definitions.push(fragmentDefinition);
	    }
	  }

	  ast.definitions = definitions;
	  return ast;
	}

	function disableFragmentWarnings() {
	  printFragmentWarnings = false;
	}

	function stripLoc(doc, removeLocAtThisLevel) {
	  var docType = Object.prototype.toString.call(doc);

	  if (docType === '[object Array]') {
	    return doc.map(function (d) {
	      return stripLoc(d, removeLocAtThisLevel);
	    });
	  }

	  if (docType !== '[object Object]') {
	    throw new Error('Unexpected input.');
	  }

	  // We don't want to remove the root loc field so we can use it
	  // for fragment substitution (see below)
	  if (removeLocAtThisLevel && doc.loc) {
	    delete doc.loc;
	  }

	  // https://github.com/apollographql/graphql-tag/issues/40
	  if (doc.loc) {
	    delete doc.loc.startToken;
	    delete doc.loc.endToken;
	  }

	  var keys = Object.keys(doc);
	  var key;
	  var value;
	  var valueType;

	  for (key in keys) {
	    if (keys.hasOwnProperty(key)) {
	      value = doc[keys[key]];
	      valueType = Object.prototype.toString.call(value);

	      if (valueType === '[object Object]' || valueType === '[object Array]') {
	        doc[keys[key]] = stripLoc(value, true);
	      }
	    }
	  }

	  return doc;
	}

	function parseDocument(doc) {
	  var cacheKey = normalize(doc);

	  if (docCache[cacheKey]) {
	    return docCache[cacheKey];
	  }

	  var parsed = parse(doc);
	  if (!parsed || parsed.kind !== 'Document') {
	    throw new Error('Not a valid GraphQL document.');
	  }

	  // check that all "new" fragments inside the documents are consistent with
	  // existing fragments of the same name
	  parsed = processFragments(parsed);
	  parsed = stripLoc(parsed, false);
	  docCache[cacheKey] = parsed;

	  return parsed;
	}

	// XXX This should eventually disallow arbitrary string interpolation, like Relay does
	function gql(/* arguments */) {
	  var args = Array.prototype.slice.call(arguments);

	  var literals = args[0];

	  // We always get literals[0] and then matching post literals for each arg given
	  var result = (typeof(literals) === "string") ? literals : literals[0];

	  for (var i = 1; i < args.length; i++) {
	    if (args[i] && args[i].kind && args[i].kind === 'Document') {
	      result += args[i].loc.source.body;
	    } else {
	      result += args[i];
	    }

	    result += literals[i];
	  }

	  return parseDocument(result);
	}

	// Support typescript, which isn't as nice as Babel about default exports
	gql.default = gql;
	gql.resetCaches = resetCaches;
	gql.disableFragmentWarnings = disableFragmentWarnings;

	module.exports = gql;

	})));
	//# sourceMappingURL=graphql-tag.umd.js.map


/***/ })

/******/ });
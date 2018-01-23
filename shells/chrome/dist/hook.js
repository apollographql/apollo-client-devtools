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

	var _hook = __webpack_require__(358);

	// inject the hook
	if (document instanceof HTMLDocument) {
	  var script = document.createElement("script");
	  script.textContent = ";(" + _hook.installHook.toString() + ")(window)";
	  document.documentElement.appendChild(script);
	  script.parentNode.removeChild(script);
	} // This script is injected into every page.

/***/ }),

/***/ 358:
/***/ (function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.installHook = installHook;
	// IMPORTANT: this script is injected into every page!!!

	/**
	 * Install the hook on window, which is an event emitter.
	 * Note because Chrome content scripts cannot directly modify the window object,
	 * we are evaling this function by inserting a script tag. That's why we have
	 * to inline the whole event emitter implementation here.
	 *
	 * special thanks to the Vue devtools for this solution
	 */

	function installHook(window) {
	  var listeners = {};

	  // XXX change how ApolloClient connects to the dev tools
	  var hook = {
	    ApolloClient: null,
	    actionLog: [],

	    on: function on(event, fn) {
	      event = "$" + event;
	      (listeners[event] || (listeners[event] = [])).push(fn);
	    },
	    once: function once(event, fn) {
	      var eventAlias = event;
	      event = "$" + event;
	      function on() {
	        this.off(eventAlias, on);
	        fn.apply(this, arguments);
	      }
	      (listeners[event] || (listeners[event] = [])).push(on);
	    },
	    off: function off(event, fn) {
	      event = "$" + event;
	      if (!arguments.length) {
	        listeners = {};
	      } else {
	        var cbs = listeners[event];
	        if (cbs) {
	          if (!fn) {
	            listeners[event] = null;
	          } else {
	            for (var i = 0, l = cbs.length; i < l; i++) {
	              var cb = cbs[i];
	              if (cb === fn || cb.fn === fn) {
	                cbs.splice(i, 1);
	                break;
	              }
	            }
	          }
	        }
	      }
	    },
	    emit: function emit(event) {
	      event = "$" + event;
	      var cbs = listeners[event];
	      if (cbs) {
	        var args = [].slice.call(arguments, 1);
	        cbs = cbs.slice();
	        for (var i = 0, l = cbs.length; i < l; i++) {
	          cbs[i].apply(this, args);
	        }
	      }
	    }
	  };

	  // this is a better way for the AC instance to connect when
	  // it is ready to send some data
	  hook.once("init", function (ApolloClient) {
	    hook.ApolloClient = ApolloClient;
	  });

	  Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
	    get: function get() {
	      return hook;
	    }
	  });

	  // XXX this is a patch to back support previous versions of Apollo Client
	  // at somepoint we should remove this.
	  // the newer version has the client connecting to the hook, not the other
	  // way around that it currently does
	  var interval = void 0;
	  var count = 0;
	  function findClient() {
	    // only try for 10seconds
	    if (count++ > 10) clearInterval(interval);
	    if (!!window.__APOLLO_CLIENT__) {
	      hook.ApolloClient = window.__APOLLO_CLIENT__;
	      hook.ApolloClient.__actionHookForDevTools(function (_ref) {
	        var _ref$state = _ref.state,
	            queries = _ref$state.queries,
	            mutations = _ref$state.mutations,
	            inspector = _ref.dataWithOptimisticResults;

	        hook.actionLog.push({ queries: queries, mutations: mutations, inspector: inspector });
	      });
	      clearInterval(interval);
	    }
	  }

	  interval = setInterval(findClient, 1000);
	}

/***/ })

/******/ });
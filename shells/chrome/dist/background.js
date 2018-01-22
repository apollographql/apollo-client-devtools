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
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	"use strict";

	// this file runs all the time and acts as the message
	// hub for the devtools. In this file, we install the proxy
	// which gives us elevated privlage to know the port of the
	// devtools pane. This makes is possible to limit listening and
	// sending of data to only be our agent => our devtools.
	// Otherwise we would have to listen to postMessage *

	// the background script runs all the time and serves as a central message
	// hub for each apollo devtools (panel + proxy + backend) instance.

	var ports = {};

	chrome.runtime.onConnect.addListener(function (port) {
	  var tab = void 0;
	  var name = void 0;
	  if (isNumeric(port.name)) {
	    tab = port.name;
	    name = "devtools";
	    installProxy(+port.name);
	  } else {
	    tab = port.sender.tab.id;
	    name = "backend";
	  }

	  if (!ports[tab]) {
	    ports[tab] = {
	      devtools: null,
	      backend: null
	    };
	  }
	  ports[tab][name] = port;

	  if (ports[tab].devtools && ports[tab].backend) {
	    doublePipe(tab, ports[tab].devtools, ports[tab].backend);
	  }
	});

	function isNumeric(str) {
	  return +str + "" === str;
	}

	function installProxy(tabId) {
	  chrome.tabs.executeScript(tabId, {
	    file: "/dist/proxy.js"
	  }, function (res) {
	    if (!res) {
	      ports[tabId].devtools.postMessage("proxy-fail");
	    } else {
	      console.log("injected proxy to tab " + tabId);
	    }
	  });
	}

	function doublePipe(id, one, two) {
	  one.onMessage.addListener(lOne);
	  function lOne(message) {
	    if (message.event === "log") {
	      return console.log("tab " + id, message.payload);
	    }
	    console.log("devtools -> backend", message);
	    two.postMessage(message);
	  }
	  two.onMessage.addListener(lTwo);
	  function lTwo(message) {
	    if (message.event === "log") {
	      return console.log("tab " + id, message.payload);
	    }
	    console.log("backend -> devtools", message);
	    one.postMessage(message);
	  }
	  function shutdown() {
	    console.log("tab " + id + " disconnected.");
	    one.onMessage.removeListener(lOne);
	    two.onMessage.removeListener(lTwo);
	    one.disconnect();
	    two.disconnect();
	    ports[id] = null;
	    updateContextMenuItem();
	  }
	  one.onDisconnect.addListener(shutdown);
	  two.onDisconnect.addListener(shutdown);
	  console.log("tab " + id + " connected.");
	  updateContextMenuItem();
	}

/***/ })
/******/ ]);
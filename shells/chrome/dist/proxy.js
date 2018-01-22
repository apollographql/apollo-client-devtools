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

	// This is a content-script that is injected only when the devtools are
	// activated. Because it is not injected using eval, it has full privilege
	// to the chrome runtime API. It serves as a proxy between the injected
	// backend and the Apollo devtools panel.

	var port = chrome.runtime.connect({ name: "content-script" });

	function sendMessageToBackend(payload) {
	  window.postMessage({ source: "apollo-devtools-proxy", payload: payload }, "*");
	}

	function sendMessageToDevtools(e) {
	  if (e.data && e.data.source === "apollo-devtools-backend") {
	    port.postMessage(e.data.payload);
	  }
	}

	function handleDisconnect() {
	  window.removeEventListener("message", sendMessageToDevtools);
	  sendMessageToBackend("shutdown");
	}

	port.onMessage.addListener(sendMessageToBackend);
	window.addEventListener("message", sendMessageToDevtools);
	port.onDisconnect.addListener(handleDisconnect);

	sendMessageToBackend("init");

/***/ })
/******/ ]);
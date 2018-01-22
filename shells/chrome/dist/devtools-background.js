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

	// this script is called whenever a user opens the chrome devtools
	// on a page. We check to see if Apollo Client exists, and if
	// it does, then we create the Apollo devtools, otherwise we poll each
	// second to see if its been created
	//
	// XXX we should show a better loading state here instead of nothing
	// much like a connector / loading page while data is loaded. Then
	// after a timeout, we can show instructions / docs for setting up
	// AC to work with the devtools

	var panelLoaded = false;
	var panelCreated = false;
	var panelShown = false;
	// stop after 10 seconds
	var checkCount = 0;
	var loadCheckInterval = void 0;

	// Manage panel visibility
	function onPanelShown() {
	  chrome.runtime.sendMessage("apollo-panel-shown");
	  panelShown = true;
	  // XXX for toast notifications
	  // panelLoaded && executePendingAction();
	}

	function onPanelHidden() {
	  chrome.runtime.sendMessage("apollo-panel-hidden");
	  panelShown = false;
	}

	function createPanel() {
	  // stop trying if above 10 seconds or already made
	  if (panelCreated || checkCount++ > 10) return;

	  panelLoaded = false;
	  panelShown = false;
	  chrome.devtools.inspectedWindow.eval("!!(window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__.ApolloClient);", function (result, isException) {
	    // XXX how should we better handle this error?
	    if (isException) console.warn(isException);

	    // already created or no ApolloClient
	    if (!result || panelCreated) return;

	    // clear watcher
	    if (loadCheckInterval) clearInterval(loadCheckInterval);
	    panelCreated = true;
	    chrome.devtools.panels.create("Apollo", "./imgs/logo_devtools.png", "devtools.html", function (panel) {
	      panel.onShown.addListener(onPanelShown);
	      panel.onHidden.addListener(onPanelHidden);
	    });
	  });
	}

	// Attempt to create Apollo panel on navigations as well
	chrome.devtools.network.onNavigated.addListener(createPanel);

	// Attempt to create Apollo panel once per second in case
	// Apollo is loaded after page load
	loadCheckInterval = setInterval(createPanel, 1000);

	// Start the first attempt immediately
	createPanel();

/***/ })
/******/ ]);
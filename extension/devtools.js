/*
var backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});

this.backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
}, function() {console.log('in devtools init')});
*/

chrome.devtools.inspectedWindow.eval(
  `!!(window.__APOLLO_CLIENT__)`,
   function(result, isException) {
     if (result) {
       chrome.runtime.sendMessage({tabId: chrome.devtools.inspectedWindow.tabId}, function() {
         console.log('send tabId to background page');
       });
       
       chrome.devtools.panels.create("Apollo", "./imgs/logo_devtools.png", "dist/index.html", function(panel) {});
     } else {
       if (isException) console.warn(isException);
     }
   }
);

let connections = {};
let apolloConnected = false;
let backgroundPageConnection = undefined;
let requestLog = {};

chrome.runtime.onConnect.addListener((port) => {
  tabId = port.name
  connections[tabId] = port;

  port.onDisconnect.addListener(port => {


    const tabs = Object.keys(connections);
    delete connections[tabId];
  });
});

chrome.runtime.onMessage.addListener((request, sender) => {

  // not sure if being used
  if (!apolloConnected && request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
    apolloConnected = true;
  }

  if (request.trimmedObj) {
    if (connections[sender.tab.id]) {
      connections[sender.tab.id].postMessage(request.trimmedObj);
    }
    else {
      let connectionsPoll = setInterval(function() {
        if (connections[sender.tab.id]) {
          connections[sender.tab.id].postMessage(request.trimmedObj);
          clearInterval(connectionsPoll);
        }
      }, 500);
    }
  }
});

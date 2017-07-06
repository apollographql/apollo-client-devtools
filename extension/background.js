let connections = {};
let apolloConnected = false;
let backgroundPageConnection = undefined;
let requestLog = {};

chrome.runtime.onConnect.addListener((port) => {
  tabId = port.name
  connections[tabId] = port;

  port.onDisconnect.addListener(port => {

    port.onMessage.removeListener(extensionListener);

    const tabs = Object.keys(connections);
    for (let i = 0; i < tabs.length; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender) => {

  // not sure if being used
  if (!apolloConnected && request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
    apolloConnected = true;
  }
  if (request.trimmedObj) {
    try {
      connections[sender.tab.id].postMessage(request.trimmedObj);
    }
    catch(err) {
      let connectionsPoll = setInterval(function() {
        if (connections[sender.tab.id]) {
          connections[sender.tab.id].postMessage(request.trimmedObj);
          clearInterval(connectionsPoll);
        }
      }, 500); 
    }
  }
});

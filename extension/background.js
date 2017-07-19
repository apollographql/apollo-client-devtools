let connections = {};
let apolloConnected = false;
let backgroundPageConnection = undefined;
let requestLog = {};

chrome.runtime.onConnect.addListener(port => {
  tabId = port.name;
  connections[tabId] = port;

  port.onDisconnect.addListener(port => {
    const tabs = Object.keys(connections);
    delete connections[tabId];
  });
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.type == 'OPEN_TAB') {
    chrome.tabs.sendMessage(request.tabId, {
      type: 'OPEN_TAB',
      activeTab: request.activeTab
    });
  }

  if (request.type == 'UPDATE_TAB_DATA') {
    if (connections[sender.tab.id]) {
      // activeTabName is the name of the opened tab
      const activeTabName = Object.keys(request)[1];
      // tabData is data to be sent
      const tabData = request[activeTabName];
      const message = {};
      message[activeTabName] = request[activeTabName];
      if (connections[sender.tab.id]) {
        connections[sender.tab.id].postMessage(message);
      }
    }
  }

  if (!apolloConnected && request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
    apolloConnected = true;
  }
});

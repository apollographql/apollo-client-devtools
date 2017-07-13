let connections = {};
let apolloConnected = false;
let backgroundPageConnection = undefined;
let requestLog = {};

chrome.runtime.onConnect.addListener(port => {
  tabId = port.name;
  connections[tabId] = port;
  // ????????????? why did I make below change
  //connections[tabId] = [port, {}];

  port.onDisconnect.addListener(port => {
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
  console.log(request);
  if (request.type == "OPEN_TAB") {
    console.log("open tab request in background.js");
    chrome.tabs.sendMessage(request.tabId, {
      type: "OPEN_TAB",
      activeTab: request.activeTab
    });
  }

  if (request.type == "UPDATE_TAB_DATA") {
    console.log("update tab request form hook");
    console.log(request);
    if (connections[sender.tab.id]) {
      // activeTabName is the name of the opened tab
      const activeTabName = Object.keys(request)[1];
      // tabData is data to be sent
      const tabData = request[activeTabName];
      const message = {};
      message[activeTabName] = request[activeTabName];
      console.log("message: ", message);
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

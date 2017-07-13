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
      connections[sender.tab.id].postMessage(request.queries);
    }
  }

  if (!apolloConnected && request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
    apolloConnected = true;
  }

  /*
  if (request.trimmedObj) {
    if (connections[sender.tab.id]) {
      //connections[sender.tab.id][0].postMessage(request.trimmedObj);
      connections[sender.tab.id].postMessage(request.trimmedObj);
    } else {
      let connectionsPoll = setInterval(function() {
        if (connections[sender.tab.id]) {
          //connections[sender.tab.id][0].postMessage(request.trimmedObj);
          connections[sender.tab.id].postMessage(request.trimmedObj);
          clearInterval(connectionsPoll);
        }
      }, 500);
    }
  }
  */
});

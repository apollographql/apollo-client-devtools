const connections = {};

chrome.runtime.onConnect.addListener(port => {
    // Listen to messages sent from the DevTools page
    port.onMessage.addListener((message, sender, sendResponse) => {
        // The original connection event doesn't include the tab ID of the
        // DevTools page, so we need to send it explicitly.
        if (message.name == "init") {
          connections[message.tabId] = port;
          return;
        }
    });

    port.onDisconnect.addListener(port => {
        port.onMessage.removeListener(extensionListener);

        const tabs = Object.keys(connections);

        for (let i = 0; i < tabs.length; i++) {
          if (connections[tabs[i]] == port) {
            delete connections[tabs[i]]
            break;
          }
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
  } else if (sender.tab.id in connections && request.APOLLO_ACTION) {
    connections[sender.tab.id].postMessage(request.APOLLO_ACTION)
  }
});

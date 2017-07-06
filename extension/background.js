var connections = {};
let apolloConnected = false;
var random = Math.random();
let backgroundPageConnection = undefined;
let requestLog = {}; // this is shitty runtime

var openCount = 0;
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

  let id = 0;
  if (request != requestLog[id]) {
    id++;
    requestLog[id] = request;
  }

  if (request.trimmedObj) {
    try {
      connections[sender.tab.id].postMessage(request.trimmedObj);
      console.log('posted apolloClientStore message');
    }
    catch(err) {
      console.log('request.trimmedObj err');
      let connectionsPoll = setInterval(function() {
        if (connections[sender.tab.id]) {
          connections[sender.tab.id].postMessage(request.trimmedObj);
          clearInterval(connectionsPoll);
        }
      }, 500); 
    }
  }
});

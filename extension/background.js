var connections = {};
let apolloConnected = false;
var random = Math.random();

var openCount = 0;
chrome.runtime.onConnect.addListener((port) => {
  console.log('in runtime connect');
  tabId = port.name
  connections[tabId] = port;
  console.log(random, tabId, port, connections);
  //port.postMessage({test: 'test'});
  /*
  if (port.name == "devtools-page") {
    if (openCount == 0) {
      alert("DevTools window opening.");
    }
    openCount++;
  }
  */


  var extensionListener = function(message, sender, sendResponse) {
    // original connection event doesn't include the tab ID of the
    // DevTools page, so need to send it explicitly
    /*
    if (message.name == "init") {
      connections[message.tabId] = port;
      return;
    }
    // */
    // other message handling
  }

  port.onMessage.addListener(extensionListener);
  
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

  // sender.tab.id and/or request.tab.id getting send from messages (could be any type of message)
  /*
  if (sender.tab.id) {
    console.log('in sender.tab.id if statement', sender.tab.id, request, sender);
  }
  if (request.tab.id) {
    console.log('in request.tab.id if statement', request.tab.id, request, sender);
  }
  */
  try {
    console.log('in sender.tab.id if statement', sender.tab.id, request, sender);
  }
  catch(err) {
    console.log(err)
    console.log('problem with sender tab id');
  }

  //tabId gets sent from devtools.js
  if (request.tabId) {
    console.log('in request.tabId');
    chrome.runtime.connect({name: request.tabId.toString()});
  }

  if (!apolloConnected && request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
    apolloConnected = true;
  }

  if (request.apolloClientStore) {
    console.log(random, 'in request.apolloClientStore');
    try {
      connections[sender.tab.id].postMessage(request.apolloClientStore);
      console.log('posted apolloClientStore message')
    }
    catch(err) {
      console.log('in err');
      chrome.runtime.connect({name: sender.tab.id.toString()});
      connections[sender.tab.id].postMessage(request.apolloClientStore);
      //console.log('posted apolloClientStore message from callback');
    }
  }
    //connections[sender.tab.id].postMessage(request.apolloClientStore);
});

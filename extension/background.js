var connections = {};
let apolloConnected = false;
var random = Math.random();
let backgroundPageConnection = undefined;

var openCount = 0;
chrome.runtime.onConnect.addListener((port) => {
  tabId = port.name
  connections[tabId] = port;
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
  /* tried below try/catch statements to expedite process of getting tab id from extension
   * but doesn't seem to be helping so probs delete
   */
  /*
  try {
    console.log('in sender.tab.id try', sender.tab.id, request, sender);
    backgroundPageConnection = chrome.runtime.connect(null, {name: sender.tab.id.toString()});
  }
  catch(err) {
    console.log(err)
    console.log('problem with sender tab id');
  }
  */

  // why did I add this???
  if (!apolloConnected && request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
    apolloConnected = true;
  }

  // post data from background.js to port set up with panel.js
  // poll to see if person has openend devtools panel in chrome extension every 500ms,
  // need tabId to instantiate port b/w background and panel to push along data from background to panel
  // tabId comes from panel.js
  if (request.apolloClientStore) {
    console.log(random, 'in request.apolloClientStore');
    try {
      connections[sender.tab.id].postMessage(request.apolloClientStore);
      console.log('posted apolloClientStore message')
    }
    catch(err) {
      console.log('request.apolloClientStore err');
      let connectionsPoll = setInterval(function() {
        //console.log('in connectionsPoll');
        //console.log(connections);
        if(connections[sender.tab.id]) {
          connections[sender.tab.id].postMessage(request.apolloClientStore);
          console.log('posted apolloClientStore message from err', request.apolloClientStore);
          //console.log(connections);
          clearInterval(connectionsPoll);
        }
      }, 500);
    }
  }
});

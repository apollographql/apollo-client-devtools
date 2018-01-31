// this file runs all the time and acts as the message
// hub for the devtools. In this file, we install the proxy
// which gives us elevated privlage to know the port of the
// devtools pane. This makes is possible to limit listening and
// sending of data to only be our agent => our devtools.
// Otherwise we would have to listen to postMessage *

// the background script runs all the time and serves as a central message
// hub for each apollo devtools (panel + proxy + backend) instance.

const ports = {};

chrome.runtime.onConnect.addListener(port => {
  let tab;
  let name;
  if (isNumeric(port.name)) {
    tab = port.name;
    name = "devtools";
    installProxy(+port.name);
  } else {
    tab = port.sender.tab.id;
    name = "backend";
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      backend: null,
    };
  }
  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab].backend) {
    doublePipe(tab, ports[tab].devtools, ports[tab].backend);
  }
});

function isNumeric(str) {
  return +str + "" === str;
}

function installProxy(tabId) {
  chrome.tabs.executeScript(
    tabId,
    {
      file: "/dist/proxy.js",
    },
    function(res) {
      if (!res) {
        ports[tabId].devtools.postMessage("proxy-fail");
      } else {
        console.log("injected proxy to tab " + tabId);
      }
    },
  );
}

function doublePipe(id, one, two) {
  one.onMessage.addListener(lOne);
  function lOne(message) {
    if (message.event === "log") {
      return console.log("tab " + id, message.payload);
    }
    console.log("devtools -> backend", message);
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    if (message.event === "log") {
      return console.log("tab " + id, message.payload);
    }
    console.log("backend -> devtools", message);
    one.postMessage(message);
  }
  function shutdown() {
    console.log("tab " + id + " disconnected.");
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
    ports[id] = null;
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
  console.log("tab " + id + " connected.");
}

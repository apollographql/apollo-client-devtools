// this script is called when the Apollo devtools panel
// is activated
import wat, { initDevTools } from "src/devtools";
import Bridge from "src/bridge";
import { createChromeStorageAdapter } from "./ChromeStorageAdapter";

createChromeStorageAdapter(chrome.storage.local, storage => {
  initDevTools({
    connect(cb) {
      // 1. inject backend code into page
      injectScript(chrome.runtime.getURL("dist/backend.js"), () => {
        // 2. connect to background to setup proxy
        const port = chrome.runtime.connect({
          name: "" + chrome.devtools.inspectedWindow.tabId,
        });
        let disconnected = false;
        port.onDisconnect.addListener(() => {
          disconnected = true;
        });

        const bridge = new Bridge({
          listen(fn) {
            port.onMessage.addListener(fn);
          },
          send(data) {
            if (!disconnected) {
              port.postMessage(data);
            }
          },
        });
        // 3. send a proxy API to the panel
        cb(bridge);
      });
    },

    onReload(reloadFn) {
      chrome.devtools.network.onNavigated.addListener(reloadFn);
    },

    storage,
  });
});

function injectScript(scriptName, cb) {
  const src = `
    (function() {
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    })()
  `;
  chrome.devtools.inspectedWindow.eval(src, function(res, err) {
    if (err) console.log(err);
    cb(res);
  });
}

import Relay from '../../Relay';

const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
const devtools = new Relay('devtools');

const port = chrome.runtime.connect({
  name: `devtools-${inspectedTabId}`,
});
port.onMessage.addListener(devtools.broadcast);

devtools.addConnection('background', (message) => {
  port.postMessage(message);
});

function sendMessageToTab(message) {
  devtools.send(message, {
    to: `background:tab-${inspectedTabId}`
  });
}

sendMessageToTab('devtools-initialized');

let isPanelCreated = false;
let isPanelOpen = false;

devtools.listen('create-panel', () => {
  if (!isPanelCreated) {
    chrome.devtools.panels.create('Apollo',
      null,
      'panel.html',
      function(panel) {
        isPanelCreated = true;

        panel.onShown.addListener(() => {
          isPanelOpen = true;
          sendMessageToTab('panel-open');
        });

        panel.onHidden.addListener(() => {
          isPanelOpen = false;
          sendMessageToTab('panel-closed');
        });
      }
    );
  }
});


// export default {
//   ...devtools,
//   sendMessageToTab,
//   sendMessageToBackground,
// }
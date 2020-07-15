import Relay from '../../Relay';

const devtools = new Relay('devtools');

const port = chrome.runtime.connect({
  name: 'devtools',
});

devtools.id = chrome.devtools.inspectedWindow.tabId;

devtools.addConnection('background', (message) => {
  port.postMessage(message);
});

port.onMessage.addListener(devtools.broadcast);

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
          devtools.send('panel-open', {
            to: 'background:tab'
          });
        });

        panel.onHidden.addListener(() => {
          isPanelOpen = false;
          devtools.send('panel-closed', {
            to: 'background:tab'
          });
        });
      }
    );
  }
});

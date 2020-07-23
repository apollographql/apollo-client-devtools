import Relay from '../../Relay';
import { 
  DEVTOOLS_INITIALIZED, 
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
} from '../constants';

const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
const devtools = new Relay('devtools');

const port = chrome.runtime.connect({
  name: `devtools-${inspectedTabId}`,
});
port.onMessage.addListener(devtools.broadcast);

devtools.addConnection('background', (message) => {
  port.postMessage(message);
});

function sendMessageToClient(message) {
  devtools.send(message, {
    to: `background:tab-${inspectedTabId}:client`
  });
}

sendMessageToClient(DEVTOOLS_INITIALIZED);

let isPanelCreated = false;
let isAppInitialized = false;

devtools.listen(CREATE_DEVTOOLS_PANEL, ({ detail: { payload } }) => {
  if (!isPanelCreated) {
    chrome.devtools.panels.create('Apollo',
      null,
      'panel.html',
      function(panel) {
        isPanelCreated = true;
        const { queries, mutations, cache } = JSON.parse(payload);

        panel.onShown.addListener(window => {
          sendMessageToClient('panel-open');

          if (!isAppInitialized) {
            window.devtools.initialize();
            window.devtools.writeData({ queries, mutations, cache: JSON.stringify(cache) });
            isAppInitialized = true;
            sendMessageToClient('request-update');

            devtools.listen(ACTION_HOOK_FIRED, () => {
              // TODO: Decide when we want to request updates.
              sendMessageToClient('request-update');
            });
  
            devtools.listen('update', ({ detail: { payload } }) => {
              const { queries, mutations, cache } = JSON.parse(payload);
              window.devtools.writeData({ queries, mutations, cache: JSON.stringify(cache) });
            });
          }
        });

        panel.onHidden.addListener(() => {
          sendMessageToClient('panel-closed');
        });
      }
    );
  }
});

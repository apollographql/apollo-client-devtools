import Relay from '../../Relay';
import { 
  DEVTOOLS_INITIALIZED, 
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
  REQUEST_DATA,
  UPDATE,
  PANEL_OPEN,
  PANEL_CLOSED,
} from '../constants';

const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
const devtools = new Relay();

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
          sendMessageToClient(PANEL_OPEN);

          if (!isAppInitialized) {
            window.__DEVTOOLS_APPLICATION__.initialize();
            window.__DEVTOOLS_APPLICATION__.writeData({ queries, mutations, cache: JSON.stringify(cache) });
            isAppInitialized = true;
            sendMessageToClient(REQUEST_DATA);

            devtools.listen(ACTION_HOOK_FIRED, () => {
              // TODO: Decide when we want to request updates.
              sendMessageToClient(REQUEST_DATA);
            });
  
            devtools.listen(UPDATE, ({ detail: { payload } }) => {
              const { queries, mutations, cache } = JSON.parse(payload);
              window.__DEVTOOLS_APPLICATION__.writeData({ queries, mutations, cache: JSON.stringify(cache) });
            });
          }
        });

        panel.onHidden.addListener(() => {
          sendMessageToClient(PANEL_CLOSED);
        });
      }
    );
  }
});

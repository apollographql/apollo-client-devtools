import Relay from '../../Relay';
import { 
  DEVTOOLS_INITIALIZED, 
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
  CACHE_EXTRACTED,
  REQUEST_CACHE_EXTRACT,
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

function sendMessageToTabClient(message) {
  devtools.send(message, {
    to: `background:tab-${inspectedTabId}:client`
  });
}

sendMessageToTabClient(DEVTOOLS_INITIALIZED);

let isPanelCreated = false;
let isAppInitialized = false;

devtools.listen(CREATE_DEVTOOLS_PANEL, () => {
  if (!isPanelCreated) {
    chrome.devtools.panels.create('Apollo',
      null,
      'panel.html',
      function(panel) {
        isPanelCreated = true;
        let actionHookListener;
        let cacheExtractedListener;

        panel.onShown.addListener(window => {
          sendMessageToTabClient('panel-open');

          if (!isAppInitialized) {
            window.devtools.initialize();
            isAppInitialized = true;
          }

          actionHookListener = devtools.listen(ACTION_HOOK_FIRED, () => {
            // Do we want to request the data?
            sendMessageToTabClient(REQUEST_CACHE_EXTRACT);
          });

          cacheExtractedListener = devtools.listen(CACHE_EXTRACTED, message => {
            console.log(message, message?.payload);
          });
        });

        panel.onHidden.addListener(() => {
          sendMessageToTabClient('panel-closed');

          // Remove listeners
          actionHookListener();
          cacheExtractedListener();
        });
      }
    );
  }
});

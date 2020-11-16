import Relay from '../../Relay';
import { REQUEST_TAB_ID } from '../constants';

// This sends the tab id to the inspected tab.
chrome.runtime.onMessage.addListener(({ message }, sender, sendResponse) => {
  if (message === REQUEST_TAB_ID) {
    sendResponse(sender?.tab?.id);
  }
});

const background = new Relay();

chrome.runtime.onConnect.addListener(port => {
  background.addConnection(port.name, message => {
    port.postMessage(message);
  });
  
  port.onMessage.addListener(message => {
    background.broadcast(message);
  });

  port.onDisconnect.addListener(port => {
    background.removeConnection(port.name);
  });
});

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
//   if (changeInfo.status == 'loading') {
//     background.broadcast({
//       message: 'LOADING',
//       to: `devtools-${tabId}`,
//     });
//   }
// });

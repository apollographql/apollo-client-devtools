import Relay from '../../Relay';
import {
  REQUEST_TAB_ID,
} from '../constants';

// This sends the tab id to the inspected tab.
chrome.runtime.onMessage.addListener(({ message }, sender, sendResponse) => {
  if (message === REQUEST_TAB_ID) {
    sendResponse(sender?.tab?.id);
  }
});

const background = new Relay();

chrome.runtime.onConnect.addListener(port => {
  background.addConnection(port.name, message => {
    try {
      port.postMessage(message);
    } catch {
      /*
      * With multiple frames, we receive a onDisconnect event twice,
      * resulting in stale ports. Without the try/catch, we drop
      * legitimate messages as well.
      */
      console.error('Error sending message to ' + port.name)
    }
  });

  port.onMessage.addListener(message => {
    background.broadcast(message);
  });

  port.onDisconnect.addListener(port => {
    background.removeConnection(port.name);
  });
});

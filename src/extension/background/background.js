import Relay from '../../Relay';
import { REQUEST_TAB_ID } from '../constants';

// This sends the tab id to the inspected tab.
chrome.runtime.onMessage.addListener(({ message }, sender, sendResponse) => {
  if (message === REQUEST_TAB_ID) {
    sendResponse(sender?.tab?.id);
  }
});

const background = new Relay();

chrome.runtime.onConnect.addListener((port) => {
  background.addConnection(port.name, message => {
    port.postMessage(message);
  });
  
  port.onMessage.addListener((message, sender) => {
    background.broadcast(message, sender);
  });

  port.onDisconnect.addListener(port => {
    background.removeConnection(port.name);
  });
});

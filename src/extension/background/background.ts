import Relay from '../../Relay';
import { 
  REQUEST_TAB_ID, 
} from '../constants';
import browser from 'webextension-polyfill';

// This sends the tab id to the inspected tab.
browser.runtime.onMessage.addListener(({ message }, sender) => {
  if (message === REQUEST_TAB_ID) {
    return Promise.resolve(sender.tab?.id);
  }
});

const background = new Relay();

browser.runtime.onConnect.addListener(port => {
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

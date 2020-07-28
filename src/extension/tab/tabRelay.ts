import Relay from '../../Relay';
import { REQUEST_TAB_ID } from '../constants';

// Inspected tabs are unable to retrieve their own ids.
// This requests the tab's id from the background script.
// Once it resolves, we can create the tab's Relay.
function requestId(){
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ message: REQUEST_TAB_ID }, function(id) {
      resolve(id);
    });
  });
}

export default new Promise(async $export => {
  const id = await requestId();
  const tab = new Relay();
  const port = chrome.runtime.connect({
    name: `tab-${id}`,
  });

  tab.addConnection('background', message => {
    port.postMessage(message);
  });

  port.onMessage.addListener(tab.broadcast);

  window.addEventListener('message', event => {
    if (event?.data?.to === 'tab') {
      tab.broadcast(event?.data);
    }

    if (event?.data?.to === 'tab:background:devtools') {
      tab.broadcast({
        ...event?.data,
        to: `background:devtools-${id}`
      });
    }
  });

  tab.addConnection('client', message => {
    window.postMessage(message, '*');
  });

  const module = await Promise.resolve({ tab, id });
  $export(module);
});

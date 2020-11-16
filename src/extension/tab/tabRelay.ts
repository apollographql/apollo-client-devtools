import Relay from '../../Relay';
import { 
  REQUEST_TAB_ID, 
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
  GRAPHIQL_RESPONSE,
  UPDATE,
  RELOAD,
} from '../constants';

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
    tab.broadcast(event?.data);
  });

  tab.addConnection('client', message => {
    console.log(message);
    window.postMessage(message, '*');
  });

  tab.forward(CREATE_DEVTOOLS_PANEL, `background:devtools-${id}`);
  tab.forward(ACTION_HOOK_FIRED, `background:devtools-${id}`);
  tab.forward(UPDATE, `background:devtools-${id}`);
  tab.forward(RELOAD, `background:devtools-${id}`);
  tab.forward(GRAPHIQL_RESPONSE, `background:devtools-${id}:graphiql`);

  const module = await Promise.resolve({ tab, id });
  $export(module);
});

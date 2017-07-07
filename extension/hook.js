const getManifest = chrome.runtime.getManifest;
const version = (getManifest && getManifest().version) || 'electron-version';
let passedApolloConnected = false;
let activeTab;
let trimmedObj;
let dataWithOptimistic;

const js = `
let isConnected = false;

const hookLogger = (logItem) => {
  console.log(logItem);

  if (!!window.__APOLLO_CLIENT__) {
    // for queries and mutations, passed through panel.js
    const trimmedObj = {
      queries: logItem.state.queries,
      mutations: logItem.state.mutations
    }
    window.postMessage({ trimmedObj }, '*');

    // for store inspector, passed through panel
    if (typeof logItem.action.type !== 'string' || logItem.action.type.split('_')[0] !== 'APOLLO') {
        return;
    }
    window.__action_log__.push(logItem);

  }
}

window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ = { version: "${version}" };

let __APOLLO_POLL_COUNT__ = 0;
const __APOLLO_POLL__ = setInterval(() => {
  if (!!window.__APOLLO_CLIENT__) {
    if (!window.__action_log__) {
      window.__action_log__ = [];
    }
    window.postMessage({ APOLLO_CONNECTED: true}, '*');
    isConnected = true;
    window.__APOLLO_CLIENT__.__actionHookForDevTools(hookLogger);
    clearInterval(__APOLLO_POLL__);
  } else {
    __APOLLO_POLL_COUNT__ += 1;
  }
  if (__APOLLO_POLL_COUNT__ > 20) clearInterval(__APOLLO_POLL__);
}, 500);
`;

let script = document.createElement('script');
script.textContent = js;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);

// event.data has the data being passed in the message
window.addEventListener('message', event => {

  if (event.source != window) 
    return;
     
  console.log(event);
  if (event.data.didMount) {
    console.log('event.data.didMount in hook');
  }

  if (event.data.APOLLO_CONNECTED) {
    if (!passedApolloConnected) {
      chrome.runtime.sendMessage({ APOLLO_CONNECTED: true}, function() {
        passedApolloConnected = true;
      });
    }
  }

  if (!!event.data.trimmedObj) {
    chrome.runtime.sendMessage({ trimmedObj: event.data.trimmedObj });
  }
  return;
});

// check which tab on extension has mounted
chrome.runtime.onMessage.addListener(
  function(request, sender) {
    activeTab = request.action;
    console.log('request', request);
    console.log(activeTab);
  }
);

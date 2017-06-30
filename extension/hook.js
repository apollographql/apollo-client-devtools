const getManifest = chrome.runtime.getManifest;
const version = (getManifest && getManifest().version) || 'electron-version';
let passedApolloConnected = false;
let apolloClientStoreLog = [];

const js = `
// where to put actionHookForDevTools part shouldn't need to go in setInterval
let isConnected = false;

const hookLogger = (stateObj) => {
  if (!!window.__APOLLO_CLIENT__) {
    const trimmedObj = {
      queries: stateObj.state.queries,
      mutations: stateObj.state.mutations
    }
    window.postMessage({ trimmedObj }, '*');
  }
}

window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ = { version: "${version}" };

let __APOLLO_POLL_COUNT__ = 0;
const __APOLLO_POLL__ = setInterval(() => {
  if (!!window.__APOLLO_CLIENT__) {
    window.postMessage({ APOLLO_CONNECTED: true}, '*');
    console.log(window.__APOLLO_CLIENT__);
    isConnected = true;
    window.__APOLLO_CLIENT__.__actionHookForDevTools(hookLogger)
    console.log('set actionHookForDevTools');
    clearInterval(__APOLLO_POLL__);
  } else {
    __APOLLO_POLL_COUNT__ += 1;
  }
  if (__APOLLO_POLL_COUNT__ > 20) clearInterval(__APOLLO_POLL__);
}, 500);
`;

var script = document.createElement('script');
script.textContent = js;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);

// event.data has the data being passed in the message
window.addEventListener('message', event => {
  console.log('in hook.js window event listener', event);
  if (event.source != window) 
    return;

  if (event.data.APOLLO_CONNECTED) {
    console.log('in event.data.APOLLO_CONNECTED');
    if (!passedApolloConnected) {
      chrome.runtime.sendMessage({ APOLLO_CONNECTED: true}, function() {
        passedApolloConnected = true;
        console.log('sent event.data.APOLLO_CONNECTED message');
      });
    }
  }

  if (!!event.data.trimmedObj) {
    chrome.runtime.sendMessage({ trimmedObj: event.data.trimmedObj }, function() {
      console.log('sent APOLLOCLIENTSTORE message', event.data.apolloClientStore);
    });
  }
  // else equivalent to if (!event.data.APOLLO_CONNECTED)
  else {
    return;
  }
});

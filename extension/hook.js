const getManifest = chrome.runtime.getManifest;
const version = (getManifest && getManifest().version) || 'electron-version';
let passedApolloConnected = false;
let contentScriptState = {
  activeTab: '',
  data: ''
};

const js = `
let isConnected = false;

const hookLogger = (logItem) => {

  
  if (typeof logItem.action.type !== 'string' || logItem.action.type.split('_')[0] !== 'APOLLO') {
        return;
  }

  if (!!window.__APOLLO_CLIENT__) {

    const newStateData = {
      queries: logItem.state.queries,
      mutations: logItem.state.mutations,
      inspector: logItem.dataWithOptimisticResults
    }

    try {
      window.postMessage({ newStateData }, '*');  
    }
    catch(err) {
      console.log(err);
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
  if (event.source != window) return;

  if (event.data.APOLLO_CONNECTED) {
    if (!passedApolloConnected) {
      chrome.runtime.sendMessage({ APOLLO_CONNECTED: true }, function () {
        passedApolloConnected = true;
      });
    }
  }

  // set up for only sending data to open panel tab
  /* lines 69 - 70 update a tab that recieves new data after it has been open for some time
   * (For example, say the mutations tab was opened at timestep 1 and remains open at timestep 2.
   *  The user then makes a mutation at timestep 2. Lines 69 - 70 will make sure the tab updates
   *  after this mutation.) This needs to be different from lines 97 - 108 because the 
   *  message source is different.
   */
  if (!!event.data.newStateData) {
    contentScriptState.data = event.data.newStateData;

    if (contentScriptState.activeTab == 'queries') {
      chrome.runtime.sendMessage({
        type: 'UPDATE_TAB_DATA',
        queries: event.data.newStateData.queries
      });
    } else if (contentScriptState.activeTab == 'mutations') {
      chrome.runtime.sendMessage({
        type: 'UPDATE_TAB_DATA',
        mutations: event.data.newStateData.mutations
      });
    } else if (contentScriptState.activeTab == 'inspector') {
      chrome.runtime.sendMessage({
        type: 'UPDATE_TAB_DATA',
        inspector: event.data.newStateData.inspector
      });
    }
  }

  return;
});

// send data to a tab only when a new tab is opened
chrome.runtime.onMessage.addListener(function (request, sender) {
  contentScriptState.activeTab = request.activeTab;
  let activeTab = contentScriptState.activeTab;
  let data = contentScriptState.data[activeTab];

  message = {
    type: 'UPDATE_TAB_DATA',
    [activeTab]: data
  };

  // sends message with data back to background page
  chrome.runtime.sendMessage(message);
});

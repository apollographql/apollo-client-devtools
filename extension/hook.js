const getManifest = chrome.runtime.getManifest;
const version = (getManifest && getManifest().version) || "electron-version";
let passedApolloConnected = false;
let contentScriptState = {
  activeTab: "",
  data: ""
};

const js = `
let isConnected = false;

const hookLogger = (logItem) => {
  if (typeof logItem.action.type !== 'string' || logItem.action.type.split('_')[0] !== 'APOLLO') {
        return;
  }

  if (!!window.__APOLLO_CLIENT__) {

    const trimmedObj = {
      queries: logItem.state.queries,
      mutations: logItem.state.mutations
    }
    window.postMessage({ trimmedObj }, '*');

    const newStateData = {
      queries: logItem.state.queries,
      mutations: logItem.state.mutations,
      state: ''
    }

    window.postMessage({ newStateData }, '*');
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

let script = document.createElement("script");
script.textContent = js;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);

// event.data has the data being passed in the message
window.addEventListener("message", event => {
  if (event.source != window) return;

  if (event.data.APOLLO_CONNECTED) {
    if (!passedApolloConnected) {
      chrome.runtime.sendMessage({ APOLLO_CONNECTED: true }, function() {
        passedApolloConnected = true;
      });
    }
  }

  // eventually get rid of trimmedObj
  /*
  if (!!event.data.trimmedObj) {
    chrome.runtime.sendMessage({ trimmedObj: event.data.trimmedObj });
  }
  */

  // set up for only sending data to open panel tab
  if (!!event.data.newStateData) {
    contentScriptState.data = event.data.newStateData;
    console.log("contentScriptState ", contentScriptState);

    if (contentScriptState.activeTab == "queries") {
      chrome.runtime.sendMessage(
        { queries: event.data.newStateData.queries },
        function() {
          console.log("send queries from hook to background");
        }
      );
      console.log("new queries");
    } else if (contentScriptState.activeTab == "mutations") {
      chrome.runtime.sendMessage({
        mutations: event.data.newStateData.mutations
      });
      console.log("new mutations");
    }
    /*
    else if (activeTab == 'store') {
      chrome.runtime.sendMessage({ store: event.data.newState.store });
    }
    */
  }

  return;
});

chrome.runtime.onMessage.addListener(function(request, sender) {
  contentScriptState.activeTab = request.activeTab;
  let activeTab = contentScriptState.activeTab;
  let data = contentScriptState.data[activeTab];
  console.log("in hook on message");
  console.log("contentScriptState from onMessage ", contentScriptState);
  console.log("activeTab: ", activeTab, "data: ", data);

  // this is jank
  message = {
    type: "UPDATE_TAB_DATA"
  };
  message[activeTab] = data;
  console.log("message: ", message);
  chrome.runtime.sendMessage(message, function() {
    console.log("sent update data message");
  });
});

import { initBackend } from "src/backend";
import Bridge from "src/bridge";

const bridge = new Bridge({
  listen(fn) {
    window.addEventListener("message", evt => fn(evt.data));
  },
  send(data) {
    console.log("backend -> devtools", data);
    window.parent.postMessage(data, "*");
  },
});

// ensure that ApolloClient is ready before init
let started = false;
const init = () => {
  if (__APOLLO_DEVTOOLS_GLOBAL_HOOK__.ApolloClient) {
    started = true;
    initBackend(bridge, window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__, localStorage);
    return;
  }
  setTimeout(init, 500);
};

init();
if (!started) setTimeout(init, 500);

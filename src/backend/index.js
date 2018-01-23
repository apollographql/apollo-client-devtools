// This is the agent that is injected into the page that an Apollo Client app lives in
// when the Apollo Devtools panel is activated.
import { initBroadCastEvents } from "./broadcastQueries";
import { initLinkEvents } from "./links";

// hook should have been injected before this executes.
const hook = window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__;
let bridge;

const connect = () => {
  initLinkEvents(hook, bridge);
  initBroadCastEvents(hook, bridge);
  bridge.log("backend ready.");
  bridge.send("ready", hook.ApolloClient.version);

  console.log(
    `%c apollo-devtools %c Detected Apollo Client v${hook.ApolloClient
      .version} %c`,
    "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
    "background:#22A699 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
    "background:transparent"
  );
};

export const initBackend = b => {
  bridge = b;

  // wire up listeners
  if (hook.ApolloClient) {
    connect();
  } else {
    hook.once("init", connect);
  }
};

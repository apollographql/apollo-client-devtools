// This is the agent that is injected into the page that an Apollo Client app lives in
// when the Apollo Devtools panel is activated.
import { initBroadCastEvents } from "./broadcastQueries";
import { initLinkEvents } from "./links";
import { checkVersions } from "./checkVersions";

// hook should have been injected before this executes.
const hook = window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__;
let bridge;
let connected;

const connect = () => {
  if (connected) return;
  connected = true;
  initLinkEvents(hook, bridge);
  initBroadCastEvents(hook, bridge);
  bridge.log("backend ready.");
  bridge.send("ready", hook.ApolloClient.version);
  checkVersions(hook, bridge);
};

export const initBackend = b => {
  bridge = b;

  connect();
};

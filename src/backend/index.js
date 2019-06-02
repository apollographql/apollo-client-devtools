// This is the agent that is injected into the page that an Apollo Client app lives in
// when the Apollo Devtools panel is activated.
import { initBroadCastEvents } from "./broadcastQueries";
import { initLinkEvents } from "./links";

let hook;
let bridge;
let connected;
let storage;

// Exposing bridge ready event, so other dev tools would have an easy way to notify apollo dev tools.
export const sendBridgeReady = () => {
  bridge.send("ready", hook.ApolloClient.version);
};

const connect = () => {
  if (connected) return;
  connected = true;
  if (Number(hook.ApolloClient.version[0]) !== 1) {
    initLinkEvents(hook, bridge);
    initBroadCastEvents(hook, bridge);
  }
  bridge.log("backend ready.");
  sendBridgeReady();
};

export const initBackend = (b, h, s) => {
  bridge = b;
  hook = h;
  storage = s;
  connect();
};

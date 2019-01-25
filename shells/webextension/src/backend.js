// this is injected into the app when the panel is activated

import { initBackend } from "src/backend";
import Bridge from "src/bridge";

window.addEventListener("message", handshake);

function handshake(e) {
  if (e.data.source === "apollo-devtools-proxy" && e.data.payload === "init") {
    window.removeEventListener("message", handshake);

    let listeners = [];
    const bridge = new Bridge({
      listen(fn) {
        var listener = evt => {
          if (evt.data.source === "apollo-devtools-proxy" && evt.data.payload) {
            fn(evt.data.payload);
          }
        };
        window.addEventListener("message", listener);
        listeners.push(listener);
      },
      send(data) {
        window.postMessage(
          {
            source: "apollo-devtools-backend",
            payload: data,
          },
          "*",
        );
      },
    });

    bridge.on("shutdown", () => {
      listeners.forEach(l => {
        window.removeEventListener("message", l);
      });
      listeners = [];
    });

    // ensure that ApolloClient is ready before init
    let started = false;
    const init = () => {
      if (__APOLLO_DEVTOOLS_GLOBAL_HOOK__.ApolloClient) {
        started = true;
        initBackend(
          bridge,
          window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__,
          localStorage,
        );
        return;
      }
      setTimeout(init, 500);
    };

    init();
    if (!started) setTimeout(init, 500);
  }
}

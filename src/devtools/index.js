import PropTypes from "prop-types";
import React, { Component } from "react";
import { render } from "react-dom";
import { StorageContextProvider } from "./context/StorageContextProvider";
import Panel from "./components/Panel";
import { BridgeProvider } from "./components/bridge";

const isChrome = typeof chrome !== "undefined" && !!chrome.devtools;
const isDark = isChrome ? chrome.devtools.panels.themeName === "dark" : false;

const createNonce = () => Math.floor(Math.random() * 1073741824);

export const initApp = shell => {
  shell.connect(bridge => {
    window.bridge = bridge;
    if (isChrome) chrome.runtime.sendMessage("apollo-panel-load");

    const expectedConnectionNonce = createNonce();
    const pendingJumpstarts = [];

    bridge.on('ready', () => {
      const data = JSON.stringify({connectionNonce: expectedConnectionNonce})
      bridge.send('backend:set-connection-nonce', data)
    })

    // Ask backend (and apollo-client in main frame) which connectionNonce is active every two seconds
    setInterval(() => {
      bridge.send("backend:get-connection-nonce", JSON.stringify({expectedConnectionNonce}));
      console.log(`sent backend:get-connection-nonce`);

      // Reload extension pane if we don't get back the expected connectionNonce in a reasonable
      // amount of time
      const jumpstart = setTimeout(() => {
        console.info('Apollo Client DevTools panel has lost heartbeat with apollo-client. Restarting panel.')
        window.location.reload();
      }, 5000)
      pendingJumpstarts.push(jumpstart);
      console.log(`Added pendingJumpstart`, pendingJumpstarts)
    }, 2000)

    // Check that apollo-client in main frame is using the current connectionNonce. If so,
    // we have an active connection and everything is working. If not, the panel is trying
    // to use an apollo-client that no longer exists (page was refreshed) and we should
    // refresh the panel by letting jumpstart timeouts expire and cause a refresh.
    bridge.on('panel:connection-nonce', data => {
      const {connectionNonce} = JSON.parse(data);
      if (connectionNonce === expectedConnectionNonce) {
        while(pendingJumpstarts.length > 0) {
          const jumpstart = pendingJumpstarts.pop();
          clearTimeout(jumpstart);
        }
      }
    })


    const app = (
      <BridgeProvider bridge={bridge}>
        <StorageContextProvider storage={shell.storage}>
          <Panel
            isChrome={isChrome}
            bridge={bridge}
            theme={isDark ? "dark" : "light"}
          />
        </StorageContextProvider>
      </BridgeProvider>
    );

    render(app, document.getElementById("app"));
  });
};

export const initDevTools = shell => {
  initApp(shell);
  shell.onReload(() => {
    bridge && bridge.removeAllListeners();
    initApp(shell);
  });
};

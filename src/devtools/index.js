import PropTypes from "prop-types";
import React, { Component } from "react";
import { render } from "react-dom";

import Panel from "./components/Panel";
import { BridgeProvider } from "./components/bridge";
import { loadAnalytics } from "./analytics";
// import runVersionCheck from "./checkVersions";

const isChrome = typeof chrome !== "undefined" && !!chrome.devtools;
const isDark = isChrome ? chrome.devtools.panels.themeName === "dark" : false;

export const initApp = shell => {
  shell.connect(bridge => {
    window.bridge = bridge;
    if (isChrome) chrome.runtime.sendMessage("apollo-panel-load");

    const app = (
      <BridgeProvider bridge={bridge}>
        <Panel
          isChrome={isChrome}
          bridge={bridge}
          theme={isDark ? "dark" : "light"}
        />
      </BridgeProvider>
    );

    render(app, document.getElementById("app"));
  });
};

export const initDevTools = shell => {
  initApp(shell);
  loadAnalytics();
  // runVersionCheck();
  shell.onReload(() => {
    console.log("reloading...");
    bridge && bridge.removeAllListeners();
    initApp(shell);
  });
};

import PropTypes from "prop-types";
import React, { Component } from "react";
import { render } from "react-dom";
import { StorageContextProvider } from "./context/StorageContextProvider";
import Panel from "./components/Panel";
import { BridgeProvider } from "./components/bridge";

const isChrome = typeof chrome !== "undefined" && !!chrome.devtools;
const isDark = isChrome ? chrome.devtools.panels.themeName === "dark" : false;

export const initApp = shell => {
  shell.connect(bridge => {
    window.bridge = bridge;
    if (isChrome) chrome.runtime.sendMessage("apollo-panel-load");
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
    window.location.reload();
  });
};

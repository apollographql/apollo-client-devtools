import React from "react";
import ReactDOM from "react-dom";
import App from "../src/components/App";
import "./index.css";

const activeTheme = chrome.devtools.panels.themeName;

if (activeTheme === 'light') {
  // using require b/c import can not be synchronously dynamically loaded
  require('./themes/light.css');
}

if (activeTheme === 'dark') {
  require('./themes/dark.css');
}

chrome.devtools.panels.create("Apollo", "", "index.html", panel => {
  /* TODO */
});

ReactDOM.render(<App />, document.querySelector("#root"));

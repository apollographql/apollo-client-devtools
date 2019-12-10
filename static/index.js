import React from "react";
import ReactDOM from "react-dom";
import App from "../src/components/App";
import "./index.css";

const devToolsPanels = chrome.devtools.panels;
const theme = devToolsPanels.themeName;

function setTheme(theme) {
  if (theme === 'default') {
    // using require b/c import can not be synchronously dynamically loaded
    require('./themes/light.css');
  }

  if (theme === 'dark') {
    require('./themes/dark.css');
  }
}

setTheme(theme);

devToolsPanels.create("Apollo", "", "index.html", panel => {
  /* TODO */
});

ReactDOM.render(<App />, document.querySelector("#root"));

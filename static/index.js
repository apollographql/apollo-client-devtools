import React from "react";
import ReactDOM from "react-dom";
import App from "../app/App";
import "./index.css";

chrome.devtools.panels.create("Apollo", "", "index.html", panel => {
  /* TODO */
});

ReactDOM.render(<App />, document.querySelector("#root"));

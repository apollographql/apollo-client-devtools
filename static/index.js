import React from "react";
import ReactDOM from "react-dom";
import App from "../app/App";
import "./index.css";

chrome.devtools.panels.create(
  'Apollo',
  null, // TODO, path to icon
  'index.html', // html page for injecting into the tab's content
  null
);

ReactDOM.render(<App />, document.querySelector("#root"));

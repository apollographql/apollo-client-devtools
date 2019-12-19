import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

import "./index.css";

const { themeName } = chrome.devtools.panels;
require(`./themes/${themeName === "dark" ? "dark" : "light"}.css`);

ReactDOM.render(<App />, document.querySelector("#root"));

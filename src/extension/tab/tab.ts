// This script is injected into each tab.
import "./tabRelay";
import browser from "webextension-polyfill";

injectScriptSync(browser.runtime.getURL("hook.js"));

// In this content script we have access to DOM, but don't have access to the webpage's window,
// so we inject this inline script tag into the webpage (allowed in Manifest V2).
// In Manifest V3, we'll have to switch this approach for Chrome-based browsers.
// This function is based on
// https://github.com/facebook/react/blob/18a9dd1c60fdb711982f32ce5d91acfe8f158fe1/packages/react-devtools-extensions/src/contentScripts/prepareInjection.js
// which is released under a MIT license (Copyright (c) Meta Platforms, Inc. and affiliates.) that can be found here:
// https://github.com/facebook/react/blob/18a9dd1c60fdb711982f32ce5d91acfe8f158fe1/LICENSE
function injectScriptSync(src: string) {
  let code = "";
  const request = new XMLHttpRequest();
  request.addEventListener("load", function () {
    code = this.responseText;
  });
  request.open("GET", src, false);
  request.send();

  const script = document.createElement("script");
  script.textContent = code;

  // This script runs before the <head> element is created,
  // so we add the script to <html> instead.
  if (typeof document === "object" && document instanceof HTMLDocument) {
    document.documentElement.appendChild(script);
    if (script.parentNode) {
      script.parentNode?.removeChild(script);
    }
  }
}

// This script is injected into each tab.
import browser from "webextension-polyfill";
import {
  createMessageBridge,
  createPortMessageAdapter,
  createWindowMessageAdapter,
} from "../messageAdapters";

const portAdapter = createPortMessageAdapter(() =>
  browser.runtime.connect({ name: "tab" })
);

createMessageBridge(portAdapter, createWindowMessageAdapter(window));

// We run the hook.js script on the page as a content script in Manifest v3
// extensions (chrome for now). We do this using execution world MAIN.
//
// We need to inject this code in this manner for Firefox because it does not
// support ExecutionWorld.MAIN:
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/ExecutionWorld
//
// In this content script we have access to DOM, but don't have access to the
// webpage's window, so we inject this inline script tag into the webpage
// instead.
//
// https://github.com/facebook/react/blob/18a9dd1c60fdb711982f32ce5d91acfe8f158fe1/packages/react-devtools-extensions/src/contentScripts/prepareInjection.js
// which is released under a MIT license (Copyright (c) Meta Platforms, Inc. and affiliates.) that can be found here:
// https://github.com/facebook/react/blob/18a9dd1c60fdb711982f32ce5d91acfe8f158fe1/LICENSE
if (__IS_FIREFOX__) {
  // eslint-disable-next-line no-inner-declarations
  function injectScript(src: string) {
    let code = "";
    const request = new XMLHttpRequest();
    request.addEventListener("load", function () {
      code = this.responseText;
    });
    request.open("GET", src, false);
    request.send();

    const script = document.createElement("script");
    script.textContent = code;

    // This script is run before the <head> element is created so we add it to
    // <html> instead.
    if (typeof document === "object" && document instanceof Document) {
      document.documentElement.appendChild(script);
      script.parentNode?.removeChild(script);
    }
  }

  injectScript(browser.runtime.getURL("hook.js"));
}

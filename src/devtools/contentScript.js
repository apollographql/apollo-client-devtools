function injectApolloClientDevTools() {
  const script = document.createElement("script");
  const file = chrome.extension.getURL("renderer.js");
  script.src = file;

  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

function once(fn, context) {
  let result;
  return function() {
    if (fn) {
      result = fn.apply(context || this, arguments);
      fn = null;
    }
    return result;
  };
}

const injectOnce = once(injectApolloClientDevTools);

/* Listen to React DevTools messages, inject our renderer interface once their
 * global hook has been attached */
window.addEventListener("message", function(evt) {
  if (
    evt.source === window &&
    evt.data &&
    evt.data.payload &&
    evt.data.payload.event === "extensionBackendInitialized"
  ) {
    injectOnce();
  }
});

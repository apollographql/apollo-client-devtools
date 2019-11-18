function injectApolloClientDevTools() {
  const script = document.createElement('script');
  const file = chrome.extension.getURL('renderer.js');
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

window.addEventListener('message', function(evt) {
  if (evt.source !== window || !evt.data) {
    return;
  } else if (evt.data.payload && evt.data.payload.event ==='extensionBackendInitialized') {
    injectOnce();
  } else {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    console.log('source!!', evt.data.source);
    console.log('hook', hook);
  }
});

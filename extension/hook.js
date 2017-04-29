const getManifest = chrome.runtime.getManifest;
const version = (getManifest && getManifest().version) || 'electron-version';

const js = `
window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ = { version: "${version}" };

let __APOLLO_POLL_COUNT__ = 0;
const __APOLLO_POLL__ = setInterval(() => {
  if (!!window.__APOLLO_CLIENT__) {
    window.postMessage({ APOLLO_CONNECTED: true }, '*');
    clearInterval(__APOLLO_POLL__);
  } else {
    __APOLLO_POLL_COUNT__ += 1;
  }

  if (__APOLLO_POLL_COUNT__ > 20) clearInterval(__APOLLO_POLL__);
}, 500)
`

var script = document.createElement('script');
script.textContent = js;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);

window.addEventListener('message', event => {
  if (event.source != window) return;
  if (!event.data.APOLLO_CONNECTED) return;

  chrome.runtime.sendMessage({ APOLLO_CONNECTED: true });
})

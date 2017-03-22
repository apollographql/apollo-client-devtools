const version = chrome.runtime.getManifest().version;
const js = ` window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ = { version: "${version}" }; `;

var script = document.createElement('script');
script.textContent = js;
document.documentElement.appendChild(script);
script.parentNode.removeChild(script);

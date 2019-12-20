// Inject custom scripts into the application under inspection window.
function injectScriptIntoInspectedWindow(scriptName: string) {
  const src = `
    (function () {
      var script =
        document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${scriptName}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    })()
  `;

  chrome.devtools.inspectedWindow.eval(src, (_res, err) => {
    if (err) console.log(err);
  });
}

// Initialize the inspected window by injecting custom functionality into it
// that's needed for communication with the AC devtools application.
export function initInspectedWindow() {
  injectScriptIntoInspectedWindow(
    chrome.runtime.getURL("injected/injected.js"),
  );
}

let panelCreated = false;
let loadCheckInterval;

function createPanel() {
  if (panelCreated) {
    return;
  }

  chrome.devtools.inspectedWindow.eval(
    `!!(window.__APOLLO_CLIENT__);`,
    function(result, isException) {
      if (isException) {
        console.warn(isException);
      }

      if (!result || panelCreated) {
        return;
      }

      if (loadCheckInterval) {
        clearInterval(loadCheckInterval);
      }
      panelCreated = true;
      chrome.devtools.panels.create(
        'Apollo',
        './imgs/logo_devtools.png',
        'dist/index.html',
        function(panel) {}
      );
    }
  );
}

// Attempt to create Apollo panel on navigations as well
chrome.devtools.network.onNavigated.addListener(createPanel);

// Attempt to create Apollo panel once per second in case
// Apollo is loaded after page load
loadCheckInterval = setInterval(createPanel, 1000);

// Start the first attempt immediately
createPanel();

var panelCreated = false;

function createPanelIfApolloLoaded() {
  if (panelCreated) {
    return;
  }
  chrome.devtools.inspectedWindow.eval(
    `!!(window.__APOLLO_CLIENT__)`,
     function(result, isException) {
       if (result) {
         clearInterval(loadCheckInterval);
         panelCreated = true;
         chrome.devtools.panels.create("Apollo", "imgs/logo.png", "dist/index.html", function(panel) {});
       } else {
         if (isException) console.warn(isException);
       }
     }
  );

}

chrome.devtools.network.onNavigated.addListener(function() {
  createPanelIfApolloLoaded();
});

// Check to see if Apollo has loaded once per second in case Apollo is added
// after page load
var loadCheckInterval = setInterval(function() {
  createPanelIfApolloLoaded();
}, 1000);

createPanelIfApolloLoaded();

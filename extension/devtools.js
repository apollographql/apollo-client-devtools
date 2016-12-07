chrome.devtools.inspectedWindow.eval(
  "!!(window.__APOLLO_CLIENT__)",
   function(result, isException) {
     if (result) {
       chrome.devtools.panels.create("Apollo", "extension/logo.png", "extension/panel.html", function(panel) {});
     } else {
       console.log("The page is not using ApolloClient");
       if (isException) console.warn(isException);
     }
   }
);

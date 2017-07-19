chrome.devtools.inspectedWindow.eval(`!!(window.__APOLLO_CLIENT__)`, function(
  result,
  isException
) {
  if (result) {
    chrome.devtools.panels.create(
      'Apollo',
      './imgs/logo_devtools.png',
      'dist/index.html',
      function(panel) {}
    );
  } else {
    if (isException) console.warn(isException);
  }
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.APOLLO_CONNECTED) {
    console.log('Showing action...');
    chrome.pageAction.show(sender.tab.id);
  }
});

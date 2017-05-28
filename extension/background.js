chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.APOLLO_CONNECTED) {
    chrome.pageAction.show(sender.tab.id);
  }
});

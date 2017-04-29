chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.APOLLO_CONNECTED) {
    chrome.browserAction.setIcon({
      path: "imgs/logo64.png",
      tabId: sender.tab.id
    })
  }
})

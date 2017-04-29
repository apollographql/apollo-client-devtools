chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.APOLLO_CONNECTED) {
    chrome.browserAction.setIcon({
      path: {
        "48": "imgs/logo128-green.png"
      },
      tabId: sender.tab.id
    })
  }
})

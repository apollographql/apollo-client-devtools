import Relay from '../../Relay';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse(sender?.tab?.id);
});

const background = new Relay('background');

chrome.runtime.onConnect.addListener((port) => {
  background.addConnection(port.name, message => {
    port.postMessage(message);
  });
  
  port.onMessage.addListener((message, sender) => {
    background.broadcast(message, sender);
  });

  port.onDisconnect.addListener(port => {
    background.removeConnection(port.name);
  });
});

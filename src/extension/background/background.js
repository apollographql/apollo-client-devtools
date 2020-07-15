import Relay from '../../Relay';

const background = new Relay('background');

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message, sender) => {
    const id = message?.id || sender?.tab?.id || port?.sender?.tab?.id;
    background.addConnection(`${port.name}:${id}`, (event) => {
      port.postMessage(event);
    });
    console.log(message);
    message.id = id;

    background.broadcast(message, sender);
  });
});

import Relay from '../../Relay';

async function requestId() {
  const promise = new Promise((resolve) => {
    chrome.runtime.sendMessage({ message: 'request' }, async function(response) {
      resolve(response);
    });
  });

  return await promise;
}

export default new Promise(async $export => {
  const id = await requestId();
  const tab = new Relay(`tab-${id}`);
  const port = chrome.runtime.connect({
    name: tab.name,
  });

  tab.addConnection('background', message => {
    port.postMessage(message);
  });

  port.onMessage.addListener(tab.broadcast);

  window.addEventListener('message', event => {
    console.log(event?.data);
    if (event?.data?.to === 'tab') {
      tab.broadcast(event?.data);
    }

    if (event?.data?.to === 'tab:background:devtools') {
      tab.broadcast({
        ...event?.data,
        to: `background:devtools-${id}`
      });
    }
  });

  tab.addConnection('client', message => {
    window.postMessage(message);
  });

  const module = await Promise.resolve({ tab, id });
  $export(module);
});

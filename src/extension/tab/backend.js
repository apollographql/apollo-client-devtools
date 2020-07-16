import tabRelay from './tabRelay';

tabRelay.then(({ tab, id }) => {
  const port = chrome.runtime.connect({
    name: tab.name,
  });

  tab.addConnection('background', message => {
    port.postMessage(message);
  });

  port.onMessage.addListener(tab.broadcast);

  tab.listen('devtools-initialized', message => {
    console.log('devtools-initialized', message);
    tab.send('create-panel', {
      to: `background:devtools-${id}`
    });
  });

  tab.listen('panel-open', message => {
    console.log('panel-open', message);
    console.log('Panel is open');
  });
});

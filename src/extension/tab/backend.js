import Relay from '../../Relay';

const tab = new Relay('tab');

const port = chrome.runtime.connect({
  name: 'tab',
});

tab.addConnection('background', (message) => {
  port.postMessage(message);
});

tab.send('create-panel', {
  to: 'background:devtools'
});

tab.listen('panel-open', (message) => {
  console.log('panel-open', message);
  console.log('Panel is open');
});

import Relay from '../../Relay';

function setup() {
  async function requestId() {
    const promise = new Promise((resolve) => {
      chrome.runtime.sendMessage({ message: 'request' }, async function(response) {
        resolve(response);
      });
    });

    return await promise;
  }

  return requestId();
}

export default new Promise(async $export => {
  const id = await setup();
  const tab = new Relay(`tab-${id}`);
  const module = await Promise.resolve({ tab, id });
  $export(module);
});

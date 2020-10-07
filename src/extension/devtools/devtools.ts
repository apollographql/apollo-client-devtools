import Relay from '../../Relay';
import { 
  DEVTOOLS_INITIALIZED, 
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
  REQUEST_DATA,
  UPDATE,
  PANEL_OPEN,
  PANEL_CLOSED,
  GRAPHIQL_REQUEST,
} from '../constants';

const inspectedTabId = chrome.devtools.inspectedWindow.tabId;
const devtools = new Relay();

const port = chrome.runtime.connect({
  name: `devtools-${inspectedTabId}`,
});
port.onMessage.addListener(devtools.broadcast);

devtools.addConnection('background', message => {
  port.postMessage(message);
});

function sendMessageToClient(message: any) {
  devtools.send({
    message,
    to: `background:tab-${inspectedTabId}:client`
  });
}

sendMessageToClient(DEVTOOLS_INITIALIZED);
let isPanelCreated = false;
let isAppInitialized = false;

devtools.listen(CREATE_DEVTOOLS_PANEL, ({ payload }) => {
  if (!isPanelCreated) {
    chrome.devtools.panels.create('Apollo',
      'logo_devtools.png',
      'panel.html',
      function(panel) {
        isPanelCreated = true;
        const { queries, mutations, cache } = JSON.parse(payload);
        let removeGraphiQLListener;

        panel.onShown.addListener(window => {
          sendMessageToClient(PANEL_OPEN);

          if (!isAppInitialized) {
            const { 
              __DEVTOOLS_APPLICATION__: {
                initialize,
                writeData,
                receiveGraphiQLRequests,
                sendResponseToGraphiQL,
              }
            } = (window as any);

            initialize();
            writeData({ queries, mutations, cache: JSON.stringify(cache) });
            isAppInitialized = true;
            sendMessageToClient(REQUEST_DATA);

            devtools.listen(ACTION_HOOK_FIRED, () => {
              // TODO: Decide when we want to request updates.
              sendMessageToClient(REQUEST_DATA);
            });

            devtools.listen(UPDATE, ({ payload }) => {
              const { queries, mutations, cache } = JSON.parse(payload);
              writeData({ queries, mutations, cache: JSON.stringify(cache) });
            });

            // Add connection so client at send to `background:devtools-${inspectedTabId}:graphiql`
            devtools.addConnection('graphiql', sendResponseToGraphiQL);
            removeGraphiQLListener = receiveGraphiQLRequests(({ detail }) => {
              devtools.broadcast(detail);
            });

            // Forward all GraphiQL requests to the client
            devtools.forward(GRAPHIQL_REQUEST, `background:tab-${inspectedTabId}:client`);
          }
        });

        panel.onHidden.addListener(() => {
          // TODO: Remove UPDATE listener
          // TODO: Remove ACTION_HOOK_FIRED listener
          // TODO: Remove devtools.forward(GRAPHIQL_REQUEST)
          devtools.removeConnection('graphiql');
          removeGraphiQLListener();
          sendMessageToClient(PANEL_CLOSED);
        });
      }
    );
  }
});

import browser from "webextension-polyfill";
import { QueryInfo } from "../tab/helpers";
import { JSONObject } from "../../application/types/json";
import { devtoolsMachine } from "../../application/machines";
import { Actor, createPortActor, createWindowActor } from "../actor";
import { DevtoolsMessage, PanelMessage } from "../messages";

const inspectedTabId = browser.devtools.inspectedWindow.tabId;

let panelHidden = true;
let connectTimeoutId: NodeJS.Timeout;

const portActor = createPortActor<DevtoolsMessage>(
  browser.runtime.connect({
    name: inspectedTabId.toString(),
  })
);

// In case we can't connect to the tab, we should at least show something to the
// user when we've attempted to connect a max number of times.
function startConnectTimeout(attempts = 0) {
  connectTimeoutId = setTimeout(() => {
    if (attempts < 3) {
      portActor.send({ type: "connectToClient" });
      startConnectTimeout(attempts + 1);
    } else {
      devtoolsMachine.send({ type: "timeout" });
    }
    // Pick a threshold above the time it takes to determine if the client is
    // found on the page. This ensures we don't reset that counter and provide a
    // proper "not found" message.
  }, 11_000);
}

portActor.on("connectToDevtools", (message) => {
  devtoolsMachine.send({
    type: "connect",
    context: {
      clientContext: JSON.parse(message.payload ?? "") as {
        queries: QueryInfo[];
        mutations: QueryInfo[];
        cache: Record<string, JSONObject>;
      },
    },
  });
});

portActor.on("connectToClientTimeout", () => {
  devtoolsMachine.send({ type: "timeout" });
});

portActor.on("disconnectFromDevtools", () => {
  devtoolsMachine.send({ type: "disconnect" });
});

portActor.on("clientNotFound", () => {
  clearTimeout(connectTimeoutId);
  devtoolsMachine.send({ type: "clientNotFound" });
});

devtoolsMachine.onTransition("retrying", () => {
  portActor.send({ type: "connectToClient" });
});

devtoolsMachine.onTransition("connected", () => {
  clearTimeout(connectTimeoutId);

  if (!panelHidden) {
    unsubscribers.add(startRequestInterval());
  }
});

devtoolsMachine.onTransition("disconnected", () => {
  unsubscribeFromAll();
});

devtoolsMachine.onTransition("notFound", () => {
  clearTimeout(connectTimeoutId);
  unsubscribeFromAll();
});

portActor.send({ type: "connectToClient" });

function startRequestInterval(ms = 500) {
  let id: NodeJS.Timeout;

  if (devtoolsMachine.matches("connected")) {
    portActor.send({ type: "requestData" });
    id = setInterval(() => portActor.send({ type: "requestData" }), ms);
  }

  return () => clearInterval(id);
}

const unsubscribers = new Set<() => void>();

function unsubscribeFromAll() {
  unsubscribers.forEach((unsubscribe) => unsubscribe());
  unsubscribers.clear();
}

let connectedToPanel = false;
let panelActor: Actor<PanelMessage>;

async function createDevtoolsPanel() {
  const panel = await browser.devtools.panels.create(
    "Apollo",
    "",
    "panel.html"
  );

  let removeUpdateListener: () => void;
  let removeExplorerForward: () => void;
  let removeSubscriptionTerminationListener: () => void;
  let removeReloadListener: () => void;
  let removeExplorerListener: () => void;

  panel.onShown.addListener((window) => {
    panelActor ||= createWindowActor<PanelMessage>(window);

    if (!connectedToPanel) {
      const state = devtoolsMachine.getState();

      panelActor.send({
        type: "initializePanel",
        state: state.value,
        payload: state.context.clientContext,
      });

      panelActor.on("retryConnection", () => {
        devtoolsMachine.send({ type: "retry" });
      });

      devtoolsMachine.subscribe(({ state }) => {
        panelActor.send({ type: "devtoolsStateChanged", state: state.value });
      });

      connectedToPanel = true;
    }

    if (devtoolsMachine.matches("initialized")) {
      portActor.send({ type: "connectToClient" });
      startConnectTimeout();
    }

    if (devtoolsMachine.matches("connected") && panelHidden) {
      unsubscribers.add(startRequestInterval());
    }

    const {
      __DEVTOOLS_APPLICATION__: { receiveSubscriptionTerminationRequest },
    } = window;

    removeUpdateListener = portActor.on("update", (message) => {
      const { queries, mutations, cache } = JSON.parse(
        message.payload ?? ""
      ) as {
        queries: QueryInfo[];
        mutations: QueryInfo[];
        cache: Record<string, JSONObject>;
      };

      panelActor.send({
        type: "update",
        payload: { queries, mutations, cache },
      });
    });

    removeExplorerForward = portActor.forward("explorerResponse", panelActor);
    removeExplorerListener = panelActor.forward("explorerRequest", portActor);

    removeSubscriptionTerminationListener =
      receiveSubscriptionTerminationRequest(() => {
        portActor.send({ type: "explorerSubscriptionTermination" });
      });

    panelHidden = false;
  });

  panel.onHidden.addListener(() => {
    panelHidden = true;
    unsubscribeFromAll();

    removeExplorerForward();
    removeSubscriptionTerminationListener();
    removeUpdateListener();
    removeReloadListener();
    removeExplorerListener();
  });
}

createDevtoolsPanel();

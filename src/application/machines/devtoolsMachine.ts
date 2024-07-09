import { setup, spawnChild, sendTo } from "xstate";
import { BannerAlert } from "../components/BannerAlert";
import { modalMachine } from "./modalMachine";

type Events =
  | { type: "connect" }
  | { type: "timeout" }
  | { type: "disconnect" }
  | { type: "clientNotFound" }
  | { type: "retry" }
  | { type: "closeModal" };

export type StateValues =
  | "initialized"
  | "retrying"
  | "connected"
  | "disconnected"
  | "timedout"
  | "notFound";

function throwIfNotOverridden(name: string) {
  return () => {
    throw new Error(`Please override the '${name}' action with .provide`);
  };
}

export const devtoolsMachine = setup({
  actors: {
    modal: modalMachine,
  },
  types: {
    events: {} as Events,
  },
  delays: {
    // connectTimeout: 10_000,
    connectTimeout: 1_000,
  },
  actions: {
    connectToClient: throwIfNotOverridden("connectToClient"),
    closeBanner: BannerAlert.close,
    notifyNotFound: throwIfNotOverridden("notifyNotFound"),
    notifyDisconnected: () => {
      BannerAlert.show({
        type: "loading",
        content: "Disconnected. Looking for client...",
      });
    },
    notifyConnected: () => {
      BannerAlert.show({ type: "success", content: "Connected!" });
    },
    notifyTimedOut: () => {
      BannerAlert.show({
        type: "error",
        content:
          "Unable to communicate with browser tab. Please reload the window and restart the devtools to try again.",
      });
    },
  },
}).createMachine({
  id: "devtools",
  initial: "initialized",
  // entry: spawnChild("modal", { id: "notFoundModal" }),
  invoke: {
    src: "modal",
    id: "notFoundModal",
  },
  on: {
    closeModal: {
      actions: sendTo("notFoundModal", { type: "close" }),
    },
  },
  states: {
    initialized: {
      on: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
      entry: "connectToClient",
      after: {
        connectTimeout: {
          target: "notFound",
        },
      },
    },
    retrying: {
      on: {
        connect: "connected",
        clientNotFound: "notFound",
      },
      entry: ["connectToClient", sendTo("notFoundModal", { type: "close" })],
    },
    connected: {
      on: {
        disconnect: "disconnected",
      },
      entry: ["notifyConnected", sendTo("notFoundModal", { type: "close" })],
      after: {
        2500: {
          actions: "closeBanner",
        },
      },
    },
    disconnected: {
      on: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
      entry: "notifyDisconnected",
      after: {
        connectTimeout: {
          target: "notFound",
        },
      },
    },
    timedout: {
      entry: "notifyTimedOut",
    },
    notFound: {
      on: {
        retry: "retrying",
        connect: "connected",
      },
      entry: ["notifyNotFound", sendTo("notFoundModal", { type: "open" })],
    },
  },
});

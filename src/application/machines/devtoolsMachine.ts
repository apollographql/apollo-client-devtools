import { setup, assign } from "xstate";
import { BannerAlert } from "../components/BannerAlert";

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
  types: {
    context: {} as { modalOpen: boolean },
    events: {} as Events,
  },
  delays: {
    connectTimeout: 10_000,
  },
  actions: {
    openModal: assign({ modalOpen: true }),
    closeModal: assign({ modalOpen: false }),
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
  context: {
    modalOpen: false,
  },
  on: {
    closeModal: {
      actions: "closeModal",
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
      entry: ["connectToClient", "closeModal"],
    },
    connected: {
      on: {
        disconnect: "disconnected",
      },
      entry: ["notifyConnected", "closeModal"],
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
      entry: ["notifyNotFound", "openModal"],
    },
  },
});

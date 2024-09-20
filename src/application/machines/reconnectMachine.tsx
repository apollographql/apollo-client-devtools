import { setup } from "xstate";
import { BannerAlert } from "../components/BannerAlert";

export type ReconnectMachineEvents = { type: "reconnect.retry" };

export const reconnectMachine = setup({
  types: {} as {
    events: ReconnectMachineEvents;
  },
  delays: {
    connectTimeout: 10_000,
  },
  actions: {
    notifyWaitingForConnection: () => {
      BannerAlert.show({
        type: "loading",
        content: "Waiting for client to connect...",
      });
    },
    notifyNotFound: () => {
      BannerAlert.show({
        type: "error",
        content: "Client not found",
      });
    },
  },
}).createMachine({
  initial: "disconnected",
  states: {
    disconnected: {
      after: {
        connectTimeout: {
          target: "notFound",
        },
      },
    },
    retrying: {
      entry: ["notifyWaitingForConnection"],
      after: {
        connectTimeout: {
          target: "notFound",
        },
      },
    },
    notFound: {
      on: {
        "reconnect.retry": "retrying",
      },
      entry: ["notifyNotFound"],
    },
  },
});

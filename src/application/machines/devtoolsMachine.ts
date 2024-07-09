import { createMachine } from "xstate";
import { BannerAlert } from "../components/BannerAlert";

type Events =
  | { type: "connect" }
  | { type: "timeout" }
  | { type: "disconnect" }
  | { type: "clientNotFound" }
  | { type: "retry" };

export type StateValues =
  | "initialized"
  | "retrying"
  | "connected"
  | "disconnected"
  | "timedout"
  | "notFound";

type Actions =
  | { type: "connectToClient" }
  | { type: "closeBanner" }
  | { type: "notifyConnected" }
  | { type: "notifyDisconnected" }
  | { type: "notifyNotFound" }
  | { type: "notifyTimedOut" };

export const devtoolsMachine = createMachine(
  {
    types: {
      actions: {} as Actions,
      events: {} as Events,
    },
    initial: "initialized",
    states: {
      initialized: {
        on: {
          connect: "connected",
          timeout: "timedout",
          clientNotFound: "notFound",
        },
        entry: "connectToClient",
        after: {
          connectToClientTimeout: {
            target: "notFound",
          },
        },
      },
      retrying: {
        on: {
          connect: "connected",
          clientNotFound: "notFound",
        },
        entry: "connectToClient",
      },
      connected: {
        on: {
          disconnect: "disconnected",
        },
        entry: "notifyConnected",
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
          connectToClientTimeout: {
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
        entry: "notifyNotFound",
      },
    },
  },
  {
    delays: {
      connectToClientTimeout: 10_000,
    },
    actions: {
      closeBanner: BannerAlert.close,
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
  }
);

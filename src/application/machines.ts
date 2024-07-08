import { assign, createMachine } from "xstate";
import { fromTimeout } from "./actors/timeoutActor";
import { BannerAlert } from "../application/components/BannerAlert";

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
  | { type: "dismissBanner" }
  | { type: "notifyConnected" }
  | { type: "notifyDisconnected" }
  | { type: "notifyNotFound" };

export const devtoolsMachine = createMachine(
  {
    types: {
      context: {} as { dismissBanner?: () => void },
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
        invoke: {
          src: fromTimeout(),
          input: 10_000,
          onDone: "notFound",
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
        invoke: {
          src: fromTimeout(),
          input: 2500,
          onDone: {
            actions: "dismissBanner",
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
        invoke: {
          src: fromTimeout(),
          input: 10_000,
          onDone: "notFound",
        },
      },
      timedout: {},
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
    actions: {
      dismissBanner: assign({
        dismissBanner: ({ context }) => {
          context.dismissBanner?.();

          return undefined;
        },
      }),
      notifyDisconnected: assign({
        dismissBanner: () => {
          return BannerAlert.show({
            type: "loading",
            content: "Disconnected. Looking for client...",
          });
        },
      }),
      notifyConnected: assign({
        dismissBanner: () => {
          return BannerAlert.show({ type: "success", content: "Connected!" });
        },
      }),
    },
  }
);

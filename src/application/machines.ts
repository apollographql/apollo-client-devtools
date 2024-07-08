import { createMachine } from "xstate";
import { timeoutLogic } from "./actors/timeoutActor";

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

type Actions = { type: "connectToClient" } | { type: "notifyConnected" };

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
        entry: ["connectToClient"],
        invoke: {
          id: "connectTimeout",
          src: "timeout",
          input: 10_000,
          onDone: {
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
      },
      disconnected: {
        on: {
          connect: "connected",
          timeout: "timedout",
          clientNotFound: "notFound",
        },
        invoke: {
          id: "connectTimeout",
          src: "timeout",
          input: 10_000,
          onDone: {
            target: "notFound",
          },
        },
      },
      timedout: {},
      notFound: {
        on: {
          retry: "retrying",
          connect: "connected",
        },
      },
    },
  },
  {
    actors: {
      timeout: timeoutLogic,
    },
  }
);

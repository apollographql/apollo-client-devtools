import { createMachine } from "xstate";
import { fromTimeout } from "./actors/timeoutActor";

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

export const devtoolsMachine = createMachine({
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
    },
    disconnected: {
      on: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
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
    },
  },
});

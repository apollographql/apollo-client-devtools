import { createMachine } from "./stateMachine";

export const devtoolsMachine = createMachine({
  initial: "initialized",
  types: {
    events: {} as
      | { type: "connect" }
      | { type: "timeout" }
      | { type: "disconnect" },
  },
  states: {
    initialized: {
      events: {
        connect: "connected",
        timeout: "timedout",
      },
    },
    connected: {
      events: {
        disconnect: "disconnected",
      },
    },
    disconnected: {
      events: {
        connect: "connected",
        timeout: "timedout",
      },
    },
    timedout: {},
  },
});

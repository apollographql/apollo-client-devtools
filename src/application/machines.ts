import { createMachine } from "./stateMachine";

export const devtoolsMachine = createMachine({
  initial: "initialized",
  types: {
    events: {} as
      | { type: "connect" }
      | { type: "timeout" }
      | { type: "disconnect" }
      | { type: "clientNotFound" }
      | { type: "retry" },
  },
  initialContext: {
    // This value needs to be JSON stringified so that it can be sent through
    // postMessage without error. Irregular cache data (such as `URL` instances
    // stored in the cache) are not cloneable via the `structuredClone`
    // algorithm.
    // https://github.com/apollographql/apollo-client-devtools/issues/1258
    clientContext: JSON.stringify({ queries: [], mutations: [], cache: {} }),
  },
  states: {
    initialized: {
      events: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
    },
    retrying: {
      events: {
        connect: "connected",
        clientNotFound: "notFound",
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
        clientNotFound: "notFound",
      },
    },
    timedout: {},
    notFound: {
      events: {
        retry: "retrying",
      },
    },
  },
});

export type DevtoolsMachine = typeof devtoolsMachine;

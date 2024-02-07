import { createMachine } from "./stateMachine";
import { QueryInfo } from "../extension/tab/helpers";
import { JSONObject } from "./types/json";

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
    clientContext: {
      queries: [] as QueryInfo[],
      mutations: [] as QueryInfo[],
      cache: {} as JSONObject,
    },
  },
  states: {
    initialized: {
      events: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
    },
    connecting: {
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
      },
    },
    timedout: {},
    notFound: {
      events: {
        retry: "connecting",
      },
    },
  },
});

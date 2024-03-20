import type { QueryInfo } from "../extension/tab/helpers";
import type { JSONObject } from "./types/json";

import { createMachine, interpret, assign } from "@xstate/fsm";

export interface ClientContext {
  queries: QueryInfo[];
  mutations: QueryInfo[];
  cache: JSONObject;
}
interface Context {
  clientContext: ClientContext;
}

type Events =
  | { type: "connect"; clientContext: ClientContext }
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

type State = {
  value: StateValues;
  context: Context;
};

const machine = createMachine<Context, Events, State>({
  initial: "initialized",
  context: {
    clientContext: {
      queries: [],
      mutations: [],
      cache: {},
    },
  },
  states: {
    initialized: {
      on: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
    },
    retrying: {
      on: {
        connect: "connected",
        clientNotFound: "notFound",
      },
    },
    connected: {
      on: {
        disconnect: "disconnected",
      },
      entry: assign({
        clientContext: (ctx, event) =>
          "clientContext" in event ? event.clientContext : ctx.clientContext,
      }),
    },
    disconnected: {
      on: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
    },
    timedout: {},
    notFound: {
      on: {
        retry: "retrying",
      },
    },
  },
});

export const devtoolsMachine = interpret(machine).start();

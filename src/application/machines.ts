import type { QueryInfo } from "../extension/tab/helpers";
import type { JSONObject } from "./types/json";

import type { StateMachine } from "@xstate/fsm";
import { createMachine } from "@xstate/fsm";

export interface ClientContext {
  clientVersion: string | null;
  queries: QueryInfo[];
  mutations: QueryInfo[];
  cache: JSONObject;
}
type Context = Record<string, never>;

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

type State = {
  value: StateValues;
  context: Context;
};

type Actions = {
  connectToClient: StateMachine.ActionFunction<Context, Events>;
  cancelRequestInterval: StateMachine.ActionFunction<Context, Events>;
  startRequestInterval: StateMachine.ActionFunction<Context, Events>;
};

export function createDevtoolsMachine({ actions }: { actions: Actions }) {
  return createMachine<Context, Events, State>(
    {
      initial: "initialized",
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
          entry: "connectToClient",
        },
        connected: {
          on: {
            disconnect: "disconnected",
          },
          entry: ["startRequestInterval"],
        },
        disconnected: {
          on: {
            connect: "connected",
            timeout: "timedout",
            clientNotFound: "notFound",
          },
          entry: ["cancelRequestInterval"],
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
    { actions }
  );
}

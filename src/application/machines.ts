import type { StateMachine } from "@xstate/fsm";
import { createMachine } from "@xstate/fsm";

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
            connect: "connected",
          },
        },
      },
    },
    { actions }
  );
}

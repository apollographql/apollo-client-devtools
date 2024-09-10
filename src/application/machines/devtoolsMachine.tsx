import type { Actor, SnapshotFrom } from "xstate";
import { setup, assign, not } from "xstate";
import { BannerAlert } from "../components/BannerAlert";
import { createContext, useContext, useMemo } from "react";
import { useSelector } from "@xstate/react";
import type { ReconnectMachineEvents } from "./reconnectMachine";
import { reconnectMachine } from "./reconnectMachine";

export interface DevtoolsMachineContext {
  listening?: boolean;
  port?: number;
  registeredClients: number;
}

type Events =
  | { type: "initializePanel"; initialContext: Partial<DevtoolsMachineContext> }
  | { type: "port.changed"; port: number; listening: boolean }
  | { type: "client.register" }
  | { type: "client.terminated" }
  | { type: "client.setCount"; count: number }
  | { type: "store.didReset" }
  | ReconnectMachineEvents;

export type DevToolsMachineEvents = Events;

export const devtoolsMachine = setup({
  types: {} as {
    context: DevtoolsMachineContext;
    events: Events;
    children: { reconnect: "reconnect" };
  },
  delays: {
    connectTimeout: 10_000,
  },
  actions: {
    closeBanner: BannerAlert.close,
    notifyDisconnected: () => {
      BannerAlert.show({
        type: "loading",
        content: "No client connected. Waiting for client to connect...",
      });
    },
    notifyConnected: () => {
      BannerAlert.show({ type: "success", content: "Connected!" });
    },

    renderUI: () => {
      throw new Error("Provide implementation");
    },
    resetStore: () => {
      throw new Error("Provide implementation");
    },
  },
  guards: {
    contextValid: ({ context }) => {
      return context.listening !== false;
    },
  },
  actors: {
    reconnect: reconnectMachine,
  },
}).createMachine({
  id: "devtools",
  type: "parallel",
  context: {
    modals: {},
    port: undefined,
    registeredClients: 0,
  },
  states: {
    initialization: {
      initial: "uninitialized",
      on: {
        "port.changed": [
          {
            actions: [
              assign(({ event }) => ({
                port: event.port,
                listening: event.listening,
              })),
            ],
          },
        ],
      },
      states: {
        uninitialized: {
          on: {
            initializePanel: {
              actions: [assign(({ event }) => event.initialContext)],
              target: "initializing",
            },
          },
        },
        initializing: {
          entry: "renderUI",
          always: [
            {
              guard: "contextValid",
              target: "ok",
            },
            {
              target: "error",
            },
          ],
        },
        error: {
          always: [
            {
              guard: "contextValid",
              target: "ok",
            },
          ],
          on: {},
        },
        ok: {
          always: {
            guard: not("contextValid"),
            target: "error",
          },
          on: {},
        },
      },
    },
    connection: {
      initial: "disconnected",
      on: {
        "client.register": {
          actions: [
            assign({
              registeredClients: ({ context }) => context.registeredClients + 1,
            }),
          ],
        },
        "client.terminated": {
          actions: [
            assign({
              registeredClients: ({ context }) => context.registeredClients - 1,
            }),
          ],
        },
        "client.setCount": {
          actions: [
            assign({
              registeredClients: ({ event }) => event.count,
            }),
          ],
        },
      },
      states: {
        connected: {
          entry: ["notifyConnected"],
          exit: ["resetStore"],
          after: {
            2500: {
              actions: "closeBanner",
            },
          },
          always: {
            guard: ({ context }) => context.registeredClients === 0,
            target: "disconnected",
          },
        },
        disconnected: {
          entry: "notifyDisconnected",
          invoke: {
            id: "reconnect",
            src: "reconnect",
          },
          always: {
            guard: ({ context }) => context.registeredClients > 0,
            target: "connected",
          },
        },
      },
    },
  },
});

export const DevToolsMachineContext = createContext<DevToolsActor | null>(null);
export function useDevToolsActorRef() {
  const contextValue = useContext(DevToolsMachineContext);
  if (!contextValue) {
    throw new Error("DevToolsMachineContext not found");
  }
  const memoizedBound = useMemo<Pick<DevToolsActor, "send" | "on">>(
    () => ({
      send: (event) => {
        // console.log("send", event);
        contextValue.send(event);
      },
      on: contextValue.on.bind(contextValue),
    }),
    [contextValue]
  );
  return memoizedBound;
}
export function useDevToolsSelector<T>(
  selector: (snapshot: SnapshotFrom<DevToolsMachine>) => T,
  compare?: (a: T, b: T) => boolean
): T {
  const actor = useContext(DevToolsMachineContext);
  if (!actor) {
    throw new Error("DevToolsMachineContext not found");
  }
  return useSelector(actor, selector, compare);
}

export type DevToolsMachine = typeof devtoolsMachine;
export type DevToolsActor = Actor<DevToolsMachine>;

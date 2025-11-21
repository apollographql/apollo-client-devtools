import type { Actor, SnapshotFrom } from "xstate";
import { setup, assign, not, sendTo, emit } from "xstate";
import { BannerAlert } from "../components/BannerAlert";
import { createContext, useContext, useMemo } from "react";
import { useSelector } from "@xstate/react";
import type { ReconnectMachineEvents } from "./reconnectMachine";
import { reconnectMachine } from "./reconnectMachine";
import { clientCountActor } from "./clientCountActor";

export interface DevtoolsMachineContext {
  listening?: boolean;
  port?: number;
  registeredClients: number;
}

type Events =
  | { type: "extensionInvalidated" }
  | { type: "initializePanel"; initialContext: Partial<DevtoolsMachineContext> }
  | { type: "port.changed"; port: number; listening: boolean }
  | { type: "client.setCount"; count: number }
  | { type: "emit.store.didReset" }
  | ReconnectMachineEvents;

export type DevToolsMachineEvents = Events;

export type EmittedEvents =
  Extract<Events, { type: `emit.${string}` }> extends infer EmitTriggerEvents
    ? {
        [K in keyof EmitTriggerEvents]: K extends "type"
          ? EmitTriggerEvents[K] extends `emit.${infer Type}`
            ? Type
            : EmitTriggerEvents[K]
          : EmitTriggerEvents[K];
      }
    : never;

export const devtoolsMachine = setup({
  types: {} as {
    context: DevtoolsMachineContext;
    events: Events;
    children: { reconnect: "reconnect" };
    emitted: EmittedEvents;
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
    notifyRestart: () => {
      BannerAlert.show({
        type: "error",
        content:
          "Could not communicate with the client. The extension might have been updated in the background. Please close and reopen the devtools and restart the page.",
      });
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
    clientCount: clientCountActor,
  },
}).createMachine({
  id: "devtools",
  type: "parallel",
  invoke: {
    id: "clientCount",
    src: "clientCount",
    onSnapshot: {
      actions: assign({
        registeredClients: ({ event }) => event.snapshot.context ?? 0,
      }),
    },
  },
  context: {
    modals: {},
    port: undefined,
    registeredClients: 0,
  },
  on: {
    // forward reconnect events to child actor
    "reconnect.*": {
      actions: sendTo("reconnect", ({ event }) => event),
    },
    // on an `emit.*` event, `emit` that event so it can be subscribed to from the app
    "emit.*": {
      actions: emit(({ event }) => {
        return {
          ...event,
          type: event.type.replace("emit.", ""),
        } as EmittedEvents;
      }),
    },
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
          on: {
            extensionInvalidated: "invalidated",
          },
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
          on: {
            extensionInvalidated: "invalidated",
          },
          invoke: {
            id: "reconnect",
            src: "reconnect",
          },
          always: {
            guard: ({ context }) => context.registeredClients > 0,
            target: "connected",
          },
        },
        invalidated: {
          entry: ["notifyRestart"],
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
      send: contextValue.send.bind(contextValue),
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

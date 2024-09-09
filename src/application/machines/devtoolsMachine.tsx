import type { Actor, SnapshotFrom } from "xstate";
import { setup, assign, not, sendParent, fromCallback } from "xstate";
import IconSync from "@apollo/icons/small/IconSync.svg";
import { BannerAlert } from "../components/BannerAlert";
import { Button } from "../components/Button";
import { createContext, useContext, useMemo } from "react";
import { useSelector } from "@xstate/react";

export interface DevtoolsMachineContext {
  modalOpen: boolean;
  port: number | false | undefined;
  registeredClients: number;
}
type Events =
  | { type: "initializePanel"; initialContext: Partial<DevtoolsMachineContext> }
  | { type: "port.changed"; port: number | false }
  | { type: "client.register" }
  | { type: "client.terminated" }
  | { type: "client.setCount"; count: number }
  | { type: "connection.retry" }
  | { type: "openModal" }
  | { type: "closeModal" }
  | { type: "store.didReset" };
export type DevToolsMachineEvents = Events;

const reconnectMachine = setup({
  types: {
    events: {} as Events,
  },
  delays: {
    connectTimeout: 10_000,
  },
  actions: {
    notifyWaitingForConnection: () => {
      BannerAlert.show({
        type: "loading",
        content: "Waiting for client to connect...",
      });
    },
    notifyNotFound: ({ self }) => {
      BannerAlert.show({
        type: "error",
        content: (
          <div className="flex justify-between items-center">
            Client not found{" "}
            <Button
              size="xs"
              variant="hidden"
              icon={<IconSync />}
              onClick={() => self.send({ type: "connection.retry" })}
            >
              Retry connection
            </Button>
          </div>
        ),
      });
    },
  },
}).createMachine({
  initial: "disconnected",
  states: {
    disconnected: {
      after: {
        connectTimeout: {
          target: "notFound",
        },
      },
    },
    retrying: {
      entry: [
        "notifyWaitingForConnection",
        sendParent({
          type: "closeModal",
        } satisfies DevToolsMachineEvents),
      ],
      after: {
        connectTimeout: {
          target: "notFound",
        },
      },
    },
    notFound: {
      on: {
        "connection.retry": "retrying",
      },
      entry: [
        "notifyNotFound",
        sendParent({
          type: "openModal",
        } satisfies DevToolsMachineEvents),
      ],
    },
  },
});

export const devtoolsMachine = setup({
  types: {
    context: {} as DevtoolsMachineContext,
    events: {} as Events,
  },
  delays: {
    connectTimeout: 10_000,
  },
  actions: {
    openModal: assign({ modalOpen: true }),
    closeModal: assign({ modalOpen: false }),
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
      return context.port !== false;
    },
  },
  actors: {
    reconnect: __IS_EXTENSION__
      ? reconnectMachine
      : fromCallback(({ sendBack }) => {
          sendBack({ type: "openModal" } satisfies DevToolsMachineEvents);
        }),
  },
}).createMachine({
  id: "devtools",
  type: "parallel",
  context: {
    modalOpen: false,
    port: undefined,
    registeredClients: 0,
  },
  on: {
    openModal: {
      actions: "openModal",
    },
    closeModal: {
      actions: "closeModal",
    },
  },
  states: {
    initialization: {
      initial: "uninitialized",
      on: {
        "port.changed": [
          {
            actions: [
              assign({
                port: ({ event }) => event.port,
              }),
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
          entry: ["notifyConnected", "closeModal"],
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

import type { Actor, SnapshotFrom } from "xstate";
import { setup, assign, not } from "xstate";
import IconSync from "@apollo/icons/small/IconSync.svg";
import { BannerAlert } from "../components/BannerAlert";
import { Button } from "../components/Button";
import { createContext, useContext } from "react";
import { useSelector } from "@xstate/react";

export interface DevtoolsMachineContext {
  modalOpen: boolean;
  port: number | false | undefined;
}
type Events =
  | { type: "initializePanel"; initialContext: Partial<DevtoolsMachineContext> }
  | { type: "port.changed"; port: number | false }
  | { type: "connect" }
  | { type: "timeout" }
  | { type: "disconnect" }
  | { type: "clientNotFound" }
  | { type: "retry" }
  | { type: "closeModal" }
  | { type: "store.didReset" };
export type DevToolsMachineEvents = Events;
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
    notifyWaitingForConnection: () => {
      BannerAlert.show({
        type: "loading",
        content: "Waiting for client to connect...",
      });
    },
    closeBanner: BannerAlert.close,
    notifyDisconnected: () => {
      BannerAlert.show({
        type: "loading",
        content: "Disconnected. Waiting for client to connect...",
      });
    },
    notifyConnected: () => {
      BannerAlert.show({ type: "success", content: "Connected!" });
    },
    notifyTimedOut: () => {
      BannerAlert.show({
        type: "error",
        content:
          "Unable to communicate with browser tab. Please reload the window and restart the devtools to try again.",
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
              onClick={() => self.send({ type: "retry" })}
            >
              Retry connection
            </Button>
          </div>
        ),
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
      return context.port !== false;
    },
  },
}).createMachine({
  id: "devtools",
  type: "parallel",
  context: {
    modalOpen: false,
    port: undefined,
  },
  on: {
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
      initial: "initialized",
      states: {
        initialized: {
          on: {
            connect: "connected",
            timeout: "timedout",
            clientNotFound: "notFound",
          },
          entry: "notifyWaitingForConnection",
          after: {
            connectTimeout: {
              target: "notFound",
            },
          },
        },
        retrying: {
          on: {
            connect: "connected",
            clientNotFound: "notFound",
          },
          entry: ["notifyWaitingForConnection", "closeModal"],
          after: {
            connectTimeout: {
              target: "notFound",
            },
          },
        },
        connected: {
          on: {
            disconnect: "disconnected",
          },
          entry: ["notifyConnected", "closeModal"],
          exit: ["resetStore"],
          after: {
            2500: {
              actions: "closeBanner",
            },
          },
        },
        disconnected: {
          on: {
            connect: "connected",
            timeout: "timedout",
            clientNotFound: "notFound",
          },
          entry: "notifyDisconnected",
          after: {
            connectTimeout: {
              target: "notFound",
            },
          },
        },
        timedout: {
          entry: "notifyTimedOut",
        },
        notFound: {
          on: {
            retry: "retrying",
            connect: "connected",
          },
          entry: ["notifyNotFound", "openModal"],
        },
      },
    },
  },
});

export const DevToolsMachineContext = createContext<DevToolsActor | null>(null);
export function useDevToolsActorRef() {
  return (
    useContext(DevToolsMachineContext) ||
    (() => {
      throw new Error("DevToolsMachineContext not found");
    })()
  );
}
export function useDevToolsSelector<T>(
  selector: (snapshot: SnapshotFrom<DevToolsMachine>) => T,
  compare?: (a: T, b: T) => boolean
): T {
  const actor = useDevToolsActorRef();
  return useSelector(actor, selector, compare);
}

export type DevToolsMachine = typeof devtoolsMachine;
export type DevToolsActor = Actor<DevToolsMachine>;

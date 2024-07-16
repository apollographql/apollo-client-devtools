import { setup, assign } from "xstate";
import IconSync from "@apollo/icons/small/IconSync.svg";
import { BannerAlert } from "../components/BannerAlert";
import { getPanelActor } from "../../extension/devtools/panelActor";
import { Button } from "../components/Button";

type Events =
  | { type: "connect" }
  | { type: "timeout" }
  | { type: "disconnect" }
  | { type: "clientNotFound" }
  | { type: "retry" }
  | { type: "closeModal" };

export const devtoolsMachine = setup({
  types: {
    context: {} as { modalOpen: boolean },
    events: {} as Events,
  },
  delays: {
    connectTimeout: 10_000,
  },
  actions: {
    openModal: assign({ modalOpen: true }),
    closeModal: assign({ modalOpen: false }),
    connectToClient: () => {
      BannerAlert.show({
        type: "loading",
        content: "Looking for client...",
      });

      getPanelActor(window).send({ type: "connectToClient" });
    },
    closeBanner: BannerAlert.close,
    notifyDisconnected: () => {
      BannerAlert.show({
        type: "loading",
        content: "Disconnected. Looking for client...",
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
    resetStore: () => {
      throw new Error("Provide implementation in the component");
    },
  },
}).createMachine({
  id: "devtools",
  initial: "initialized",
  context: {
    modalOpen: false,
  },
  on: {
    closeModal: {
      actions: "closeModal",
    },
  },
  states: {
    initialized: {
      on: {
        connect: "connected",
        timeout: "timedout",
        clientNotFound: "notFound",
      },
      entry: "connectToClient",
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
      entry: ["connectToClient", "closeModal"],
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
});

import { setup } from "xstate";
import IconSync from "@apollo/icons/small/IconSync.svg";
import { BannerAlert } from "../components/BannerAlert";
import { Button } from "../components/Button";

export type ReconnectMachineEvents = { type: "connection.retry" };

export const reconnectMachine = setup({
  types: {} as {
    events: ReconnectMachineEvents;
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
      entry: ["notifyWaitingForConnection"],
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
      entry: ["notifyNotFound"],
    },
  },
});

import { log, setup } from "xstate";

type Events = { type: "open" } | { type: "close" };

export const modalMachine = setup({
  types: {
    events: {} as Events,
  },
}).createMachine({
  id: "modal",
  initial: "closed",
  states: {
    open: {
      on: {
        close: {
          target: "closed",
          actions: log("close"),
        },
      },
      entry: [({ self }) => console.log("open", self.id, self)],
    },
    closed: {
      on: {
        open: { target: "open", actions: log("open") },
      },
      entry: [({ self }) => console.log("closed", self.id, self)],
    },
  },
});

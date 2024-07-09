import { setup } from "xstate";

type Events = { type: "open" } | { type: "close" };

export const modalMachine = setup({
  types: {
    events: {} as Events,
  },
}).createMachine({
  initial: "closed",
  states: {
    open: {
      on: {
        close: "closed",
      },
    },
    closed: {
      on: {
        open: "open",
      },
    },
  },
});

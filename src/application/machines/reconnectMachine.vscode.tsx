import { setup } from "xstate";
export const reconnectMachine = setup({
  delays: { connectTimeout: 500 },
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
    notFound: {
      on: {},
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NoInfer<T> = [T][T extends any ? 0 : never];

type Machine<State extends string, EventName extends string> = {
  initial: NoInfer<State>;
  types: {
    events: { type: EventName };
  };
  states: {
    [K in State]: {
      events?: Partial<Record<EventName, NoInfer<State>>>;
    };
  };
};

function createMachine<State extends string, EventName extends string>(
  machine: Machine<State, EventName>
) {
  const current = {
    value: machine.initial,
  };

  function send(event: { type: EventName }) {
    const { events } = machine.states[current.value];
    const nextState = events?.[event.type];

    if (nextState) {
      transitionTo(nextState);
    }
  }

  function transitionTo(state: State) {
    current.value = state;
  }

  function getSnapshot() {
    return current;
  }

  return { send, getSnapshot };
}

export const machine = createMachine({
  initial: "initialized",
  types: {
    events: {} as
      | { type: "connect" }
      | { type: "timeout" }
      | { type: "disconnect" },
  },
  states: {
    initialized: {
      events: {
        connect: "connected",
        timeout: "timedout",
      },
    },
    connected: {
      events: {
        disconnect: "disconnected",
      },
    },
    disconnected: {
      events: {
        connect: "connected",
        timeout: "timedout",
      },
    },
    timedout: {},
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NoInfer<T> = [T][T extends any ? 0 : never];

type MachineConfig<State extends string, EventName extends string> = {
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

type CurrentState<State extends string> = {
  value: State;
};

type Listener<State extends string> = (
  currentState: CurrentState<State>
) => void;

export function createMachine<State extends string, EventName extends string>(
  machine: MachineConfig<State, EventName>
) {
  const listeners = new Set<Listener<State>>();

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

    listeners.forEach((listener) => listener(current));
  }

  function getSnapshot() {
    return current;
  }

  function subscribe(listener: Listener<State>) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  return { send, getSnapshot, subscribe };
}

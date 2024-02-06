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
  const stateListeners = new Map<State, Set<() => void>>();

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
    stateListeners.get(state)?.forEach((listener) => listener());
  }

  function getState() {
    return current;
  }

  function subscribe(listener: Listener<State>) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function onTransition(state: State, listener: () => void) {
    if (!stateListeners.has(state)) {
      stateListeners.set(state, new Set());
    }

    const listeners = stateListeners.get(state)!;
    listeners.add(listener);

    return () => listeners?.delete(listener);
  }

  function matches(state: State) {
    return current.value === state;
  }

  return { send, getState, subscribe, onTransition, matches };
}

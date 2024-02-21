import { NoInfer, SafeAny } from "../types";

interface Machine<
  State extends string,
  EventName extends string,
  Context extends Record<string, unknown>,
> {
  send: (event: Event<EventName, Context>) => void;
  getState: () => CurrentState<State, Context>;
  subscribe: (listener: Listener<State, EventName, Context>) => () => void;
  onTransition: (state: State, listener: () => void) => () => void;
  matches: (state: State) => boolean;
}

type MachineConfig<
  State extends string,
  EventName extends string,
  Context extends Record<string, unknown>,
> = {
  initial: NoInfer<State>;
  /**
   * Provides type hints to the machine on what events are allowed.
   *
   * @example
   * ```ts
   * createMachine({
   *   types: {} as {
   *     events: { type: "connect" } | { type: "timeout" };
   *   }
   * })
   */
  types: {
    events: { type: EventName };
  };
  initialContext?: Context;
  states: {
    [K in State]: {
      events?: Partial<Record<EventName, NoInfer<State>>>;
    };
  };
};

type CurrentState<
  State extends string,
  Context extends Record<string, unknown>,
> = {
  context: Context;
  value: State;
};

type Listener<
  State extends string,
  EventName extends string,
  Context extends Record<string, unknown>,
> = (detail: {
  state: CurrentState<State, Context>;
  event: Event<EventName, Context>;
}) => void;

type Event<
  EventName extends string,
  Context extends Record<string, unknown>,
> = { type: EventName; context?: Partial<Context> };

export type GetStates<TMachine> =
  TMachine extends Machine<infer State, SafeAny, SafeAny> ? State : never;

export type GetContext<TMachine> =
  TMachine extends Machine<SafeAny, SafeAny, infer Context> ? Context : never;

export function createMachine<
  State extends string,
  EventName extends string,
  Context extends Record<string, unknown> = Record<string, never>,
>(
  machine: MachineConfig<State, EventName, Context>
): Machine<State, EventName, Context> {
  const listeners = new Set<Listener<State, EventName, Context>>();
  const stateListeners = new Map<State, Set<() => void>>();

  const current = {
    context: machine.initialContext ?? ({} as Context),
    value: machine.initial,
  };

  function send(event: Event<EventName, Context>) {
    const { events } = machine.states[current.value];
    const nextState = events?.[event.type];

    if (nextState) {
      transitionTo(nextState, event);
    }

    if (process.env.NODE_ENV === "development") {
      if (!nextState) {
        console.warn(
          `Transition from state '${current.value}' for event '${event.type}' not found.`
        );
      }
    }
  }

  function transitionTo(state: State, sourceEvent: Event<EventName, Context>) {
    current.value = state;

    if (sourceEvent.context) {
      current.context = { ...current.context, ...sourceEvent.context };
    }

    listeners.forEach((listener) =>
      listener({ state: current, event: sourceEvent })
    );
    stateListeners.get(state)?.forEach((listener) => listener());
  }

  function getState() {
    return current;
  }

  function subscribe(listener: Listener<State, EventName, Context>) {
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

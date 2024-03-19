import { createMachine } from "../stateMachine";

test("getState returns initial state", () => {
  const machine = createMachine({
    initial: "idle",
    initialContext: {},
    types: {} as { events: { type: "ignore" } },
    states: {
      idle: {},
    },
  });

  expect(machine.getState()).toEqual({ value: "idle", context: {} });
});

test("can transition to another state", () => {
  const machine = createMachine({
    initial: "off",
    initialContext: {},
    types: {} as {
      events: { type: "on" } | { type: "off" };
    },
    states: {
      off: {
        events: {
          on: "on",
        },
      },
      on: {
        events: { off: "off" },
      },
    },
  });

  machine.send({ type: "on" });

  expect(machine.getState()).toEqual({ value: "on", context: {} });
});

test("does not transition and warns when sending event that current state does not handle", () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  const machine = createMachine({
    initial: "pending",
    initialContext: {},
    types: {} as {
      events: { type: "resolve" } | { type: "reject" };
    },
    states: {
      pending: {
        events: {
          resolve: "fulfilled",
          reject: "rejected",
        },
      },
      fulfilled: {},
      rejected: {},
    },
  });

  machine.send({ type: "resolve" });
  machine.send({ type: "reject" });

  expect(machine.getState()).toEqual({ value: "fulfilled", context: {} });

  expect(consoleSpy).toHaveBeenCalledTimes(1);
  expect(consoleSpy).toHaveBeenCalledWith(
    "Transition from state 'fulfilled' for event 'reject' not found."
  );

  consoleSpy.mockRestore();
  process.env.NODE_ENV = originalEnv;
});

test("can set context on machine while sending event", () => {
  const machine = createMachine({
    initial: "pending",
    initialContext: {
      value: "initial",
    },
    types: {} as {
      events: { type: "resolve" } | { type: "reject" };
    },
    states: {
      pending: {
        events: {
          resolve: "fulfilled",
          reject: "rejected",
        },
      },
      fulfilled: {},
      rejected: {},
    },
  });

  expect(machine.getState()).toEqual({
    value: "pending",
    context: { value: "initial" },
  });

  machine.send({ type: "resolve", context: { value: "resolved" } });

  expect(machine.getState()).toEqual({
    value: "fulfilled",
    context: { value: "resolved" },
  });
});

test("can subscribe to state changes", () => {
  const machine = createMachine({
    initial: "off",
    initialContext: { count: 0 },
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const listener = jest.fn();
  const unsubscribe = machine.subscribe(listener);

  machine.send({ type: "turnOn", context: { count: 1 } });

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith({
    state: { value: "on", context: { count: 1 } },
    event: { type: "turnOn", context: { count: 1 } },
  });

  unsubscribe();

  machine.send({ type: "turnOff", context: { count: 2 } });

  expect(listener).toHaveBeenCalledTimes(1);
});

test("can listen to transitions to a specific state", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const onListener = jest.fn();
  const offListener = jest.fn();
  machine.onTransition("on", onListener);
  machine.onTransition("off", offListener);

  machine.send({ type: "turnOn" });
  expect(onListener).toHaveBeenCalledTimes(1);
  expect(offListener).toHaveBeenCalledTimes(0);

  machine.send({ type: "turnOff" });
  expect(onListener).toHaveBeenCalledTimes(1);
  expect(offListener).toHaveBeenCalledTimes(1);
});

test("can listen to transitions from a specific state", () => {
  const machine = createMachine({
    initial: "off",
    types: {} as {
      events: { type: "turnOn" } | { type: "turnOff" };
    },
    states: {
      off: {
        events: {
          turnOn: "on",
        },
      },
      on: {
        events: {
          turnOff: "off",
        },
      },
    },
  });

  const onListener = jest.fn();
  const offListener = jest.fn();
  machine.onLeave("on", onListener);
  machine.onLeave("off", offListener);

  machine.send({ type: "turnOn" });
  expect(onListener).toHaveBeenCalledTimes(0);
  expect(offListener).toHaveBeenCalledTimes(1);

  machine.send({ type: "turnOff" });
  expect(onListener).toHaveBeenCalledTimes(1);
  expect(offListener).toHaveBeenCalledTimes(1);
});

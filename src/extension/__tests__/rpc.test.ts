import { createRPCProvider, createRPCHandler } from "../rpc";

function createTestAdapter<Messages = unknown>() {
  let listener: ((message: unknown) => void) | null;
  const removeListener = jest.fn(() => {
    listener = null;
  });

  return {
    mocks: { removeListener },
    simulatePlainMessage: (message: unknown) => {
      listener?.(message);
    },
    simulateDevtoolsMessage: (message: Messages) => {
      listener?.({ source: "apollo-client-devtools", message });
    },
    addListener: jest.fn((fn) => {
      listener = fn;

      return removeListener;
    }),
    postMessage: jest.fn(),
  };
}

test("can send and receive rpc messages", async () => {
  type Message = { type: "add"; x: number; y: number };
  const adapter = createTestAdapter<Message>();
  const provider = createRPCProvider(adapter);
  const handler = createRPCHandler(adapter);

  const promise = provider.send({ type: "add", x: 1, y: 2 });

  expect(adapter.postMessage).toHaveBeenCalledTimes(1);
  expect(adapter.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    id: expect.any(Number),
    message: { type: "add", x: 1, y: 2 },
  });

  // const id = adapter.postMessage.mock.calls[0][0].id;

  handler.handle("add", ({ x, y }) => x + y);

  // adapter.simulateDevtoolsMessage({
  //   source: "apollo-client-devtools",
  //   id,
  //   result: 3,
  // });

  await expect(promise).resolves.toBe(3);
});

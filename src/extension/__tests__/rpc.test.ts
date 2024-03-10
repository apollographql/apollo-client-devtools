import { SafeAny } from "../../types";
import { RPC, createRpcClient, createRpcHandler } from "../rpc";

function createTestAdapter() {
  let listener: ((message: unknown) => void) | null;
  const removeListener = jest.fn(() => {
    listener = null;
  });

  return {
    mocks: { removeListener },
    simulatePlainMessage: (message: unknown) => {
      listener?.(message);
    },
    simulateDevtoolsMessage: (message: Record<string, SafeAny>) => {
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
  type Message = RPC<"add", { x: number; y: number }, number>;
  const adapter = createTestAdapter();
  const client = createRpcClient<Message>(adapter);
  const handler = createRpcHandler<Message>(adapter);

  const promise = client.request("add", { x: 1, y: 2 });

  expect(adapter.postMessage).toHaveBeenCalledTimes(1);
  expect(adapter.postMessage).toHaveBeenCalledWith({
    source: "apollo-client-devtools",
    id: 1,
    message: { type: "add", params: { x: 1, y: 2 } },
  });

  handler.on("add", ({ x, y }) => x + y);

  await expect(promise).resolves.toBe(3);
});

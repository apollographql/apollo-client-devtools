import type { ActorMessage } from "@/extension/actor";
import type {
  ApolloClientDevtoolsMessage,
  DevtoolsPostMessage,
} from "@/extension/messages";
import { createDevtoolsMessage, MessageType } from "@/extension/messages";
import type { RPCResponseMessage } from "@/extension/rpc";
import type { DistributiveOmit } from "@/types";

export type TestSource = ReturnType<typeof createTestSource>;

export function createTestSource() {
  let listener: ((message: unknown) => void) | null = null;
  const messages: ApolloClientDevtoolsMessage[] = [];
  const removeListener = jest.fn(() => {
    listener = null;
  });

  let proxy: { simulatePlainMessage: typeof simulatePlainMessage } | undefined;

  const simulatePlainMessage = (message: unknown) => {
    listener?.(message);
  };

  const simulateDevtoolsMessage = (message: DevtoolsPostMessage) => {
    simulatePlainMessage(createDevtoolsMessage(message));
  };

  return {
    addListener: jest.fn((fn: (message: unknown) => void) => {
      listener = fn;

      return removeListener;
    }),
    postMessage: jest.fn((message) => {
      messages.push(message);
      proxy?.simulatePlainMessage(message);
    }),
    mocks: { messages, removeListener },
    simulatePlainMessage,
    simulateDevtoolsMessage,
    simulateActorMessage: (message: ActorMessage) => {
      simulateDevtoolsMessage({ type: MessageType.Actor, message });
    },
    simulateRPCResponse<TResult = unknown>(
      message: DistributiveOmit<
        RPCResponseMessage<TResult>,
        "id" | "source" | "type"
      >
    ) {
      simulateDevtoolsMessage({ ...message, type: MessageType.RPCResponse });
    },
    simulateRPCStreamChunk<TValue = unknown>(streamId: string, value: TValue) {
      simulateDevtoolsMessage({
        type: MessageType.RPCStreamChunk,
        streamId,
        value,
      });
    },
    // Connects this source to another source so that a postMessage from this
    // source calls listeners on the other source. This isn't forwarding, but
    // rather tries to simulate the window.postMessage(),
    // window.addEventListener('message') behavior.
    connect(other: { simulatePlainMessage: typeof simulatePlainMessage }) {
      proxy = other;
    },
  };
}

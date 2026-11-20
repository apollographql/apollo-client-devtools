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

  const simulateDevtoolsMessage = (message: DevtoolsPostMessage) => {
    listener?.(createDevtoolsMessage(message));
  };

  return {
    addListener: jest.fn((fn: (message: unknown) => void) => {
      listener = fn;

      return removeListener;
    }),
    postMessage: jest.fn((message) => messages.push(message)),
    mocks: { messages, removeListener },
    simulatePlainMessage: (message: unknown) => {
      listener?.(message);
    },
    simulateDevtoolsMessage,
    simulateActorMessage: (message: ActorMessage) => {
      simulateDevtoolsMessage({ type: MessageType.Actor, message });
    },
    simulateRPCResponse<TResult = unknown>(
      message: DistributiveOmit<RPCResponseMessage<TResult>, "source">
    ) {
      simulateDevtoolsMessage({ ...message, type: MessageType.RPCResponse });
    },
  };
}

import { ReadableStream } from "node:stream/web";
import { MessageChannel, MessagePort } from "node:worker_threads";
import type { DeepPartial } from "@apollo/client/utilities";

const channels: MessageChannel[] = [];
afterAll(() => {
  channels.forEach(({ port1, port2 }) => {
    port1.close();
    port2.close();
  });
});

Object.defineProperties(globalThis, {
  MessageChannel: {
    configurable: true,
    value: class extends MessageChannel {
      constructor() {
        super();
        channels.push(this);
      }
    },
  },
  MessagePort: {
    configurable: true,
    value: MessagePort,
  },
  ReadableStream: { value: ReadableStream },
  requestIdleCallback: {
    value: ((cb, options) => {
      const id = setTimeout(() => {
        cb({ didTimeout: false, timeRemaining: () => 0 });
      }, options?.timeout);
      return id as unknown as number;
    }) as typeof requestIdleCallback,
  },
  cancelIdleCallback: {
    value: (id: number) => clearTimeout(id),
  },
  chrome: {
    value: {
      runtime: {
        id: "mock",
      },
      storage: {
        local: {
          get: ((_keys, cb) => {
            const value = {} as Record<string, any>;
            if (cb !== undefined) {
              cb(value as any);
            }
            return Promise.resolve(value);
          }) as typeof globalThis.chrome.storage.local.get,
        },
      },
    } satisfies DeepPartial<typeof globalThis.chrome>,
  },
});

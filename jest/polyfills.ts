import { ReadableStream } from "node:stream/web";
import type { DeepPartial } from "@apollo/client/utilities";

Object.defineProperties(globalThis, {
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

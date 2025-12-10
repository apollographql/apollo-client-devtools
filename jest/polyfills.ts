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
    } satisfies DeepPartial<typeof globalThis.chrome>,
  },
});

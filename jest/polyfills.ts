import { ReadableStream } from "node:stream/web";

Object.defineProperties(globalThis, {
  ReadableStream: { value: ReadableStream },
});

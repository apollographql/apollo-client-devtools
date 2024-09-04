/* eslint-disable @typescript-eslint/no-explicit-any */
function noop() {
  return true;
}

const _WeakRef =
  typeof WeakRef !== "undefined"
    ? WeakRef
    : (function <T>(value: T) {
        return { deref: () => value } satisfies Omit<
          WeakRef<any>,
          typeof Symbol.toStringTag
        >;
      } as any as typeof WeakRef);

export { _WeakRef as WeakRef };

const _FinalizationRegistry =
  typeof FinalizationRegistry !== "undefined"
    ? FinalizationRegistry
    : (function <T>() {
        return {
          register: noop,
          unregister: noop,
        } satisfies Omit<FinalizationRegistry<T>, typeof Symbol.toStringTag>;
      } as any as typeof FinalizationRegistry);

export { _FinalizationRegistry as FinalizationRegistry };

/**
 * A workaround to set the `maxListeners` property of a node EventEmitter without having to import
 * the `node:events` module, which would make the code non-portable.
 */
export function setMaxListeners(maxListeners: number, emitter: any) {
  const key = Object.getOwnPropertySymbols(new AbortController().signal).find(
    (key) => key.description === "events.maxEventTargetListeners"
  );
  if (key) emitter[key] = maxListeners;
}

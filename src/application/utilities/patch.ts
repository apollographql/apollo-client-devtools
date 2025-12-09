import type { FunctionKeys } from "./types";

export function patch<
  T extends object,
  TName extends FunctionKeys<T>,
  TMethod extends (...args: any[]) => any = T[TName] extends (
    ...args: any[]
  ) => any
    ? T[TName]
    : never,
>(
  obj: T,
  name: TName,
  patch: (
    this: ThisType<TMethod>,
    originalFn: TMethod,
    ...args: Parameters<TMethod>
  ) => ReturnType<TMethod>
) {
  // Track when we revert the monkey patch back to the original function in case
  // other extensions/code adds additional monkey patches on top of this one
  // which might accidentally restore this monkey patched function. If we've
  // reverted our patch, but these patched functions run instead, we can short
  // circuit our patch as if it wasn't there.
  let reverted = false;
  const original = obj[name];

  assertFunction<TMethod>(original);

  obj[name] = function (
    this: ThisType<typeof original>,
    ...args: Parameters<typeof original>
  ): ReturnType<typeof original> {
    if (reverted) {
      return original.apply(this, args);
    }

    return patch.apply(this, [original, ...args]);
  } as typeof original;

  return function revert() {
    obj[name] = original;
    reverted = true;
  };
}

function assertFunction<TMethod extends (...args: any[]) => any>(
  fn: unknown
): asserts fn is TMethod {
  if (typeof fn !== "function") {
    throw new Error("Cannot patch non-function");
  }
}

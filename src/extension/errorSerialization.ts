import type { SerializedErrorLike } from "./errors";

const errorConstructors = [
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
].reduce(
  (memo, constructor) => memo.set(constructor.name, constructor),
  new Map<string, new (message?: string) => Error>()
);

export function serializeError(error: unknown): SerializedErrorLike {
  return error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { message: String(error) };
}

export function deserializeError({
  name,
  message,
  stack,
}: SerializedErrorLike) {
  const ErrorClass = name ? errorConstructors.get(name) ?? Error : Error;
  const error = new ErrorClass(message);

  if (name && error.name !== name) {
    error.name = name;
  }

  if (stack) {
    error.stack = stack;
  }

  return error;
}

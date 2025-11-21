export interface SerializedErrorLike {
  name?: string;
  message: string;
  stack?: string;
}

export class ExtensionInvalidatedError extends Error {
  static is(error: unknown): error is ExtensionInvalidatedError {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ExtensionInvalidatedError"
    );
  }

  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);
    this.name = "ExtensionInvalidatedError";
    Object.setPrototypeOf(this, ExtensionInvalidatedError.prototype);
  }
}

export const RPC_MESSAGE_TIMEOUT = "RPC_MESSAGE_TIMEOUT";

export function isExtensionInvalidatedError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("extension context invalidated")
  );
}

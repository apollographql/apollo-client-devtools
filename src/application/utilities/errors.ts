import type { GraphQLFormattedError } from "graphql";

export function hasExtensionInvalidatedError(
  errors: ReadonlyArray<GraphQLFormattedError> | undefined
) {
  return (
    errors?.some(
      (error) => error.extensions?.code === "EXTENSION_INVALIDATED"
    ) ?? false
  );
}

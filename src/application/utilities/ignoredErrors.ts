import { CombinedGraphQLErrors } from "@apollo/client";
import { hasExtensionInvalidatedError } from "./errors";

const IGNORED_ERRORS = [/^Store reset/];

export function isIgnoredError(error: Error) {
  if (CombinedGraphQLErrors.is(error)) {
    return hasExtensionInvalidatedError(error.errors);
  }

  return IGNORED_ERRORS.some((regex) => regex.test(error.message));
}

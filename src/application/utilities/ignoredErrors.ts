const IGNORED_ERRORS = [/^Store reset/];

export function isIgnoredError(error: Error) {
  return IGNORED_ERRORS.some((regex) => regex.test(error.message));
}

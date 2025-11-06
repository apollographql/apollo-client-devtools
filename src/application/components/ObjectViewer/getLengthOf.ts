/**
 * Returns the length of a value such as an array or object. Return of -1
 * means the value is not an array or object.
 */
export function getLengthOf(value: unknown) {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length;
  }

  return -1;
}

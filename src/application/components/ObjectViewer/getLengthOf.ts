export function getLengthOf(value: unknown) {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length;
  }

  return -1;
}

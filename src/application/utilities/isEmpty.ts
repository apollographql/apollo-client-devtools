export function isEmpty(value: object | null | undefined) {
  return value == null || Object.keys(value).length === 0;
}

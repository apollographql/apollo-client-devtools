export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce(
    (memo, key) => (key in obj ? { ...memo, [key]: obj[key] } : memo),
    {} as Pick<T, K>
  );
}

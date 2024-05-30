export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce(
    (memo, key) => ({ ...memo, [key]: obj[key] }),
    {} as Pick<T, K>
  );
}

export const DELETED = -1;
export const ADDED = 1;
export const CHANGED = 0;

export type DiffValue =
  | typeof ADDED
  | [typeof DELETED, value: unknown]
  | [typeof CHANGED, oldValue: unknown, newValue: unknown];

export type DiffObject = { [key: string | number | symbol]: Diff };
export type Diff = DiffValue | DiffValue[] | DiffObject;

// return of `undefined` means the values are equal
export function diff(a: any, b: any): Diff | undefined {
  if (a === b) {
    return;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return [CHANGED, a, b];
    }
    const result = [];

    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (Object.hasOwn(a, i) && Object.hasOwn(b, i)) {
        const itemDiff = diff(a[i], b[i]) as any;

        if (itemDiff !== undefined) {
          result[i] = itemDiff;
        }
      } else if (Object.hasOwn(a, i)) {
        result[i] = [DELETED, a[i]];
      } else {
        result[i] = ADDED;
      }
    }

    return result.length === 0 ? undefined : result;
  }

  if (isPlainObject(a)) {
    if (!isPlainObject(b)) {
      return [CHANGED, a, b];
    }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const result: Record<string, any> = {};

    for (const key of keys) {
      if (Object.hasOwn(a, key) && Object.hasOwn(b, key)) {
        const keyDiff = diff(a[key], b[key]);

        if (keyDiff !== undefined) {
          result[key] = keyDiff;
        }
      } else if (Object.hasOwn(a, key)) {
        result[key] = [DELETED, a[key]];
      } else {
        result[key] = ADDED;
      }
    }

    return Object.keys(result).length === 0 ? undefined : result;
  }

  return [CHANGED, a, b];
}

function isPlainObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

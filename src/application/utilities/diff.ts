export const DELETED = -1;
export const ADDED = 1;
export const CHANGED = 0;

// return of `undefined` means the values are equal
export function diff(a: any, b: any) {
  if (a === b) {
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const length = Math.max(a.length, b.length);
    const result = [];

    for (let i = 0; i < length; i++) {
      if (i in a && i in b) {
        const itemDiff = diff(a[i], b[i]) as any;

        if (itemDiff !== undefined) {
          result[i] = itemDiff;
        }
      } else if (i in a) {
        result[i] = [DELETED, a[i]];
      } else {
        result[i] = ADDED;
      }
    }

    return result.length === 0 ? undefined : result;
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    const result: Record<string, any> = {};

    for (const key of keys) {
      if (key in a && key in b) {
        const keyDiff = diff(a[key], b[key]);

        if (keyDiff !== undefined) {
          result[key] = keyDiff;
        }
      } else if (key in a) {
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

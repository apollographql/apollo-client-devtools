export type DiffValue = Added | Deleted | Changed;

export type DiffObject = { [key: string | number | symbol]: Diff };
export type Diff = DiffValue | DiffValue[] | DiffObject;

export class Changed {
  readonly oldValue: unknown;
  readonly newValue: unknown;

  constructor(oldValue: unknown, newValue: unknown) {
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
}

export class Added {
  readonly value: unknown;

  constructor(value: unknown) {
    this.value = value;
  }
}

export class Deleted {
  readonly value: unknown;

  constructor(value: unknown) {
    this.value = value;
  }
}

// return value of `undefined` means inputs are deeply equal
export function diff(a: any, b: any): Diff | undefined {
  if (a === b) {
    return;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return new Changed(a, b);
    }
    const result = [];

    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (Object.hasOwn(a, i) && Object.hasOwn(b, i)) {
        const itemDiff = diff(a[i], b[i]) as any;

        if (itemDiff !== undefined) {
          result[i] = itemDiff;
        }
      } else if (Object.hasOwn(a, i)) {
        result[i] = new Deleted(a[i]);
      } else {
        result[i] = new Added(b[i]);
      }
    }

    return result.length === 0 ? undefined : result;
  }

  if (isPlainObject(a)) {
    if (!isPlainObject(b)) {
      return new Changed(a, b);
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
        result[key] = new Deleted(a[key]);
      } else {
        result[key] = new Added(b[key]);
      }
    }

    return Object.keys(result).length === 0 ? undefined : result;
  }

  return new Changed(a, b);
}

function isPlainObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

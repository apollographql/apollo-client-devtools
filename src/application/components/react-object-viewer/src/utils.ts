export function getIterateDescriptors(o: any) {
  const descriptors = Object.getOwnPropertyDescriptors(o);
  const arr = [];
  for (const key in descriptors) {
    arr.push({ key, descriptor: descriptors[key] });
  }

  if (o instanceof Set) {
    arr.push({
      key: "[[Values]]",
      descriptor: {
        enumerable: true,
        value: [...o.entries()].reduce<Record<number, any>>((d, e) => {
          d[e[0] - 1] = e[1];
          return d;
        }, {}),
      },
    });
  }

  if (o instanceof Map) {
    arr.push({
      key: "[[Entries]]",
      descriptor: {
        enumerable: true,
        value: [...o.entries()].reduce<
          Record<string, { key: any; value: any }>
        >((d, e, i) => {
          d[i] = { key: e[0], value: e[1] };
          return d;
        }, {}),
      },
    });
  }

  const prototype = Object.getPrototypeOf(o);
  if (prototype !== null) {
    const descriptors = Object.getOwnPropertyDescriptors(prototype);
    for (const key in descriptors) {
      if (!descriptors[key].enumerable && !descriptors[key].get) continue;
      if (key === "__proto__") continue;
      arr.push({ key, descriptor: descriptors[key] });
    }
    arr.push({
      key: "[[Prototype]]",
      descriptor: { enumerable: false, value: prototype },
    });
  }
  return arr;
}

export function getType(v: any) {
  const type = typeof v;
  if (type === "object") {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
  }
  return type;
}

export function getPrototype(o: any) {
  return Object.prototype.toString.call(o);
}

export function getConstructorName(v: object) {
  try {
    return Object.getPrototypeOf(v).constructor.name;
  } catch (err) {
    // SecurityError: Failed to read a named property 'constructor' from 'Window': Blocked a frame with origin "xxx" from accessing a cross-origin frame.
    return `<Blocked>`;
  }
}

export function clsx(o: Record<string, any> | any[]) {
  if (Array.isArray(o)) {
    return o.filter((e) => !!e).join(" ");
  }
  const strs: string[] = [];
  for (const k in o) {
    if (k && (o as any)[k]) strs.push(k);
  }
  return strs.join(" ");
}

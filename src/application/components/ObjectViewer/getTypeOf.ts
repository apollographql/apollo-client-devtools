export type ObjType = ReturnType<typeof getTypeOf>;

export function getTypeOf(value: unknown) {
  switch (typeof value) {
    case "object": {
      if (value === null) {
        return "null";
      }

      if (Array.isArray(value)) {
        return "array";
      }

      return "object";
    }
    default:
      return typeof value;
  }
}

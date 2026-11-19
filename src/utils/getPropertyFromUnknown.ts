export function getPropertyFromUnknown<T>(
  value: unknown,
  key: string | number | symbol
): T | undefined {
  if (value != null && typeof value === "object" && key in value) {
    return (value as any)[key];
  }
}

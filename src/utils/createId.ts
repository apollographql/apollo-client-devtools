export function createId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = new Uint8Array(10);
  crypto.getRandomValues(values);

  return Array.from(values)
    .map((number) => chars[number % chars.length])
    .join("");
}

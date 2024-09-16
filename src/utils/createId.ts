export function createId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return new Array(10)
    .fill(null)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join("");
}

export function restoreErrorCodes(
  { allMessages, allConditions, allFiles, byVersion },
  version
) {
  /** @type {import("@apollo/client/invariantErrorCodes.js").ErrorCodes} */
  const result = {};

  const array = decodeBase64(byVersion[version]);
  for (let i = 0; i < array.length / 3; i++) {
    const entry = (result[i + 1] = {});

    const file = allFiles[array[i * 3 + 1]];
    if (file !== undefined) entry.file = file;
    const condition = allConditions[array[i * 3 + 2]];
    if (condition !== undefined) entry.condition = condition;
    const message = allMessages[array[i * 3]];
    if (message !== undefined) entry.message = message;
  }
  return result;
}

function decodeBase64(input) {
  const binary = atob(input);
  const bytes = new Uint16Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

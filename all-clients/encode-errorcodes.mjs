import { registerHooks } from "node:module";
import pkg from "./package.json" with { type: "json" };
import { writeFile } from "node:fs/promises";
import { restoreErrorCodes } from "./restore-errorcodes.mjs";
import assert from "node:assert";
import { gt } from "semver";

registerHooks({
  resolve(specifier, context, nextResolve) {
    const regex = /^@apollo-client\/(.*?)\/invariantErrorCodes\.js$/;
    const match = regex.exec(specifier);
    const version = match?.[1];

    return nextResolve(
      version
        ? `./node_modules/@apollo-client/${version}/invariantErrorCodes.js`
        : specifier,
      context
    );
  },
});

function getLookupArray() {
  const map = new Map();
  const array = [null];
  function lookup(value) {
    if (map.has(value)) {
      return map.get(value);
    } else {
      const index = array.push(value) - 1;
      map.set(value, index);
      return index;
    }
  }
  return [array, lookup];
}

let nextErrorId = 0;
const [allMessages, getMessageIndex] = getLookupArray();
const [allFiles, getFileIndex] = getLookupArray();
const [allConditions, getConditionIndex] = getLookupArray();
const byVersion = {};
const errors = {};

const prefix = "@apollo-client/";
for (const partialPath of Object.keys(pkg.dependencies).sort((a, b) =>
  gt(a.substring(prefix.length), b.substring(prefix.length)) ? 1 : -1
)) {
  const match = new RegExp("/([^/]*)$").exec(partialPath);
  if (!match) continue;
  const version = match[1];
  const from = import.meta.resolve(`${partialPath}/invariantErrorCodes.js`);

  const { devDebug, devLog, devWarn, devError, errorCodes } = await import(
    from
  );
  const combinedEntries = Object.entries({
    ...devDebug,
    ...devLog,
    ...devWarn,
    ...devError,
    ...errorCodes,
  });

  const collected = new Uint16Array(
    (Math.max(...Object.keys(combinedEntries)) + 1) * 3
  );

  for (const entry of combinedEntries) {
    const code = entry[0] - 1;
    /** @type {{file: string, condition?: string, message: string}} */
    const { file, condition, message } = entry[1];

    collected[code * 3] = getMessageIndex(message);
    collected[code * 3 + 1] = getFileIndex(file);
    collected[code * 3 + 2] = getConditionIndex(condition);
  }
  const encoded = Buffer.from(collected).toString("base64");
  const errorId = String(
    Object.keys(errors).find((id) => errors[id] === encoded) ?? ++nextErrorId
  );
  errors[errorId] = encoded;
  byVersion[version] = errorId;

  // we immediately restore to verify a full roundtrip
  assert.deepStrictEqual(
    restoreErrorCodes(
      { allMessages, allConditions, allFiles, byVersion, errors },
      version
    ),
    Object.fromEntries(combinedEntries)
  );
}
const encoded = JSON.stringify(
  {
    allMessages,
    allConditions,
    allFiles,
    byVersion,
    errors,
  },
  undefined,
  2
);

writeFile("errorcodes.json", encoded, "utf-8");

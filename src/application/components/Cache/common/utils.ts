import { JSONObject } from "../../../types/json";

// Return an alphabetically sorted list of all root cache ID's. ROOT_QUERY,
// ROOT_MUTATION, and ROOT_SUBSCRIPTION will be listed first (if they exist).
export function getRootCacheIds(data: JSONObject = {}) {
  const sortedRootIds: string[] = [];

  ["ROOT_QUERY", "ROOT_MUTATION", "ROOT_SUBSCRIPTION"].forEach((id) => {
    if (data[id]) {
      sortedRootIds.push(id);
    }
  });

  const sortedNonRootIds = Object.keys(data)
    .filter((id) => !id.startsWith("ROOT_"))
    .sort();

  return [...sortedRootIds, ...sortedNonRootIds];
}

// Filter the passed in object, returning a new object that has any keys or
// values that match the specified keywords. Object values are only matched
// if they are strings, all matching is case insensitive, and only top
// level values are checked (nested objects are skipped).
export function objectFilter(data: JSONObject, keywords: string) {
  let results: JSONObject | undefined;
  const regex = new RegExp(keywords, "i");
  Object.keys(data).forEach((key) => {
    const value = data[key];
    const keyMatch = regex.test(key);
    const valueMatch = typeof value === "string" && regex.test(value);
    if (keyMatch || valueMatch) {
      if (results === undefined) results = {};
      results[key] = value;
    }
  });
  return results;
}

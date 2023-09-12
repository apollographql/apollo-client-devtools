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

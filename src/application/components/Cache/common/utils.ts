// Return an alphabetically sorted list of all root cache ID's. ROOT_QUERY,
// ROOT_MUTATION, and ROOT_SUBSCRIPTION will be listed first (if they exist).
export function getRootCacheIds(data = {}) {
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

// Is the passed in parameter an Object.
function isObject(obj) {
  return typeof obj === "object" && obj !== null;
}

// Is the passed in property an Apollo Client cache reference property.
function isRef(property) {
  return property === "__ref";
}

// Recursively walk a cache object, replacing all references to other entities
// in the cache, with the entities themselves. When rendering cache data in
// a tree view, this helps show nested cache objects directly in the tree,
// instead of showing references themselves.
function inlineCacheRefs(
  cacheData: Record<string, any>,
  currentData?: Record<string, any>,
  parentData?: Record<string, any>,
  parentKey?: string
) {
  if (!currentData) {
    currentData = cacheData;
  }

  if (isObject(currentData)) {
    Object.keys(currentData).forEach((key) => {
      if (isObject(currentData![key])) {
        inlineCacheRefs(cacheData, currentData![key], currentData, key);
      } else if (isRef(key)) {
        if (Array.isArray(parentData)) {
          parentData[parentKey!] = cacheData[currentData![key]];
        } else {
          currentData![key] = cacheData[currentData![key]];
        }
      }
    });
  }

  return currentData;
}

// Parses the stringified version of cache data into an object, replacing
// references to nested objects in the hierarchy, with the pointed to objects
// themselves (to make it easier to show nested objects in tree views).
export function convertCacheJsonIntoObject(jsonData: string) {
  if (!jsonData) {
    throw new Error("Missing cache JSON data");
  }

  let parsedData: Record<string, any> = JSON.parse(jsonData);
  parsedData = inlineCacheRefs(parsedData);
  return parsedData;
}

// Filter the passed in object, returning a new object that has any keys or
// values that match the specified keywords. Object values are only matched
// if they are strings, all matching is case insensitive, and only top
// level values are checked (nested objects are skipped).
export function objectFilter(data: Record<string, any>, keywords: string) {
  let results;
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

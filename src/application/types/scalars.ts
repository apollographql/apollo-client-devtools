import type { Cache } from "@apollo/client";
import type { JSONObject, JSONValue } from "./json";

export type Cache = JSONObject;
export type DateTime = string;
export type Variables = JSONObject;
export type QueryData = JSONObject;
export type QueryOptions = JSONObject;
export type JSON = JSONObject;
export type Diff = JSONValue;
export type GraphQLErrorPath = ReadonlyArray<string | number>;
export type DirectCacheWriteOptions = Cache.WriteOptions;
export type WriteQueryOptions = Cache.WriteQueryOptions<any, any>;
export type WriteFragmentOptions = Cache.WriteFragmentOptions<any, any>;
export type CacheModifyOptions = Omit<Cache.ModifyOptions, "fields"> & {
  fields: string | Record<string, string>;
};

import type { ApolloClient } from "@apollo/client";
import type { JSONObject } from "./json";

export type Variables = JSONObject;
export type QueryData = JSONObject;
export type MemoryInternals = ReturnType<
  NonNullable<ApolloClient<unknown>["getMemoryInternals"]>
>;

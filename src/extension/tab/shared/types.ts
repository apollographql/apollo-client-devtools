import type { DocumentNode } from "graphql";
import type { JSONObject } from "@/application/types/json";
import type { Cache as ApolloCache } from "@apollo/client";
import type { Cache } from "@/application/types/scalars";

export type CacheWrite = {
  timestamp: Date;
  cache: {
    before: Cache;
    after: Cache;
  };
} & (
  | {
      type: "modify";
      options: Omit<ApolloCache.ModifyOptions, "fields"> & {
        fields: string | Record<string, string | undefined>;
      };
    }
  | { type: "write"; options: ApolloCache.WriteOptions }
  | { type: "writeQuery"; options: ApolloCache.WriteQueryOptions<any, any> }
  | {
      type: "writeFragment";
      options: ApolloCache.WriteFragmentOptions<any, any>;
    }
);

export type FragmentWatch = {
  name: string;
  document: DocumentNode;
  count: number;
  // Watched entities and their variables (`id` is `null` when the entity
  // couldn't be identified)
  entities: Array<{
    id: string | null;
    variables: JSONObject | null;
  }>;
};

export type FragmentWatchData = {
  data: JSONObject | null;
  complete: boolean;
};

export type TimingStat = {
  count: number;
  // Time spent in the method excluding time spent in nested timed methods
  // (e.g. `diff` calls made while broadcasting watches)
  selfMs: number;
  totalMs: number;
};

export type OperationTimings = {
  key: string;
  kind: "query" | "mutation" | "subscription" | "fragment";
  name: string;
  write: TimingStat;
  diff: TimingStat;
};

export type CacheTimings = {
  // Identifies the recording. Counters restart when a new recording starts.
  id: string;
  broadcastWatches: TimingStat;
  operations: OperationTimings[];
};

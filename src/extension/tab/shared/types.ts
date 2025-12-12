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

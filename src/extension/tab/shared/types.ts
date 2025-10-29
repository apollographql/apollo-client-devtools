import type { JSONObject } from "@/application/types/json";
import type { Cache } from "@/application/types/scalars";
import type { DocumentNode, OperationVariables } from "@apollo/client";

export interface CacheWrite {
  document: DocumentNode;
  data: JSONObject | null;
  variables: OperationVariables | undefined;
  dataId: string | undefined;
  overwrite: boolean | undefined;
  broadcast: boolean | undefined;
  cache: {
    before: Cache;
    after: Cache;
  };
}

import { createRpcHandler } from "../rpc";
import type { MessageAdapter } from "../messageAdapters";
import allErrorCodes from "../../../all-clients/errorcodes.json";
import { restoreErrorCodes } from "../../../all-clients/restore-errorcodes.mjs";

export function handleErrorCodes(adapter: MessageAdapter, signal: AbortSignal) {
  createRpcHandler(adapter)(
    "getErrorCodes",
    (version) => {
      if (version in allErrorCodes.byVersion) {
        return restoreErrorCodes(allErrorCodes, version);
      }
    },
    { signal }
  );
}

import browser from "webextension-polyfill";
import { createRpcHandler } from "../rpc";
import { createPortMessageAdapter } from "../messageAdapters";
import type { ErrorCodes } from "@apollo/client/invariantErrorCodes.js";
import allErrorCodes from "../../../all-clients/errorcodes.json";
import { restoreErrorCodes } from "../../../all-clients/restore-errorcodes.mjs";

export type ErrorCodesHandler = {
  getErrorCodes(version: string): Promise<ErrorCodes | undefined>;
};
browser.runtime.onConnect.addListener((port) => {
  if (port.name === "tab") {
    const handleRpc = createRpcHandler<ErrorCodesHandler>(
      createPortMessageAdapter(() => port)
    );
    handleRpc("getErrorCodes", (version) => {
      if (version in allErrorCodes.byVersion) {
        return restoreErrorCodes(allErrorCodes, version);
      }
    });
  }
});

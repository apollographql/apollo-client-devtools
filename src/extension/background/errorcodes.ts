import browser from "webextension-polyfill";
import { createRpcHandler } from "../rpc";
import { createPortMessageAdapter } from "../messageAdapters";
import allErrorCodes from "../../../all-clients/errorcodes.json";
import { restoreErrorCodes } from "../../../all-clients/restore-errorcodes.mjs";

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "tab") {
    const handleRpc = createRpcHandler(createPortMessageAdapter(() => port));

    handleRpc("getErrorCodes", (version) => {
      if (version in allErrorCodes.byVersion) {
        return restoreErrorCodes(allErrorCodes, version);
      }
    });
  }
});

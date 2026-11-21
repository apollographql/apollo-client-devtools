import browser from "webextension-polyfill";
import { createRpcHandler } from "../rpc";
import { connectStaticPortMessageAdapter } from "../messageAdapters";
import allErrorCodes from "../../../all-clients/errorcodes.json";
import { restoreErrorCodes } from "../../../all-clients/restore-errorcodes.mjs";

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "tab") {
    const handleRpc = createRpcHandler(connectStaticPortMessageAdapter(port));

    handleRpc("getErrorCodes", (version) => {
      if (version in allErrorCodes.byVersion) {
        return restoreErrorCodes(allErrorCodes, version);
      }
    });
  }
});

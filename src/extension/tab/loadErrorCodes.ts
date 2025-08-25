import type { ErrorCodes } from "@/types";
import type { RpcClient } from "../rpc";

export function loadErrorCodes(rpcClient: RpcClient, version: string) {
  rpcClient
    .request("getErrorCodes", version)
    .catch(() => {})
    .then((errorCodes) => {
      if (!errorCodes) return;

      const ApolloErrorMessageHandler = Symbol.for(
        "ApolloErrorMessageHandler_" + version
      );
      const global = globalThis as typeof globalThis & {
        [ApolloErrorMessageHandler]: typeof handler & ErrorCodes;
      };

      if (!global[ApolloErrorMessageHandler]) {
        global[ApolloErrorMessageHandler] = handler as typeof handler &
          ErrorCodes;
      }

      function handler(message: string | number, args: unknown[]) {
        if (typeof message === "number") {
          const definition = global[ApolloErrorMessageHandler]![message];
          if (!message || !definition?.message) return;
          message = definition.message;
        }
        return args.reduce<string>(
          (msg, arg) => msg.replace(/%[sdfo]/, String(arg)),
          String(message)
        );
      }

      const globalHandler = global[ApolloErrorMessageHandler];
      if (
        // We will inject values if the global handler is the one injected by the devtools
        globalHandler === handler ||
        // or if it is an object with at least one numeric key.
        // In this case we assume that it's the default handler of Apollo Client that is
        // injected via `loadErrorMessageHandler`, which can only be called in ways that
        // assign at least one numeric key to it.
        Object.keys(globalHandler).some((key) => /^\d+$/.test(key))
      ) {
        // add loaded messages to global handler function
        Object.assign(globalHandler, errorCodes, {
          // do not overwrite existing error messages
          ...globalHandler,
        });
      }
    });
}

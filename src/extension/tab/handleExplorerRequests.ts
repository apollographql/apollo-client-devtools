import type { Actor, OptionsWithAbortSignal } from "../actor";
import type { ApolloClient } from "@apollo/client";
import type { ClientHandler } from "./clientHandler";

export function handleExplorerRequests(
  actor: Actor,
  getHandlerByClientId: (
    clientId: string
  ) => ClientHandler<ApolloClient> | undefined,
  options: OptionsWithAbortSignal = {}
) {
  return actor.on(
    "explorerRequest",
    ({ payload }) => {
      const handler = getHandlerByClientId(payload.clientId);

      if (!handler) {
        throw new Error("Could not find selected client");
      }

      const observable = handler.executeOperation(payload);
      const subscription = observable.subscribe((payload) => {
        actor.send({ type: "explorerResponse", payload });
      });

      actor.on(
        "explorerSubscriptionTermination",
        () => subscription.unsubscribe(),
        options
      );

      if (options.signal) {
        options.signal.addEventListener(
          "abort",
          () => subscription.unsubscribe(),
          { once: true }
        );
      }
    },
    options
  );
}

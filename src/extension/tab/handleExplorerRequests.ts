import type { ApolloClient } from "@/types";
import type { Actor, OptionsWithAbortSignal } from "../actor";
import type { ClientHandler } from "./clientHandler";

export function handleExplorerRequests(
  actor: Actor,
  getHandler: () => ClientHandler<ApolloClient> | undefined,
  options: OptionsWithAbortSignal = {}
) {
  return actor.on(
    "explorerRequest",
    ({ payload }) => {
      const handler = getHandler();

      if (!handler) {
        return;
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

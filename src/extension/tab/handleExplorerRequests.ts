import type { Actor, OptionsWithAbortSignal } from "../actor";
import type { ApolloClient } from "@/types";
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

      if (subscription.closed) return;
      const stop = () => subscription.unsubscribe();
      const { signal } = options;
      if (signal?.aborted) return stop();

      subscription.add(actor.on("explorerSubscriptionTermination", stop));
      if (signal) {
        signal.addEventListener("abort", stop);
        subscription.add(() => signal.removeEventListener("abort", stop));
      }
    },
    options
  );
}

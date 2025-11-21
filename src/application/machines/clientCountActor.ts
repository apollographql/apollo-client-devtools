import { map, type Subscription } from "rxjs";
import { fromObservable } from "xstate";
import { client } from "..";
import type { TypedDocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ClientCount } from "../types/gql";

export const clientCountActor = fromObservable(() => {
  let subscription: Subscription;
  function watchQuery() {
    return client
      .watchQuery({
        query: gql`
          query ClientCount {
            clients {
              id
            }
          }
        ` as TypedDocumentNode<ClientCount>,
        fetchPolicy: "cache-only",
      })
      .pipe(
        map(({ data, dataState }) =>
          dataState === "complete" ? data.clients.length : 0
        )
      );
  }

  return {
    subscribe: (observer) => {
      subscription = watchQuery().subscribe(observer as any);
      const removeListener = client.onClearStore(async () => {
        subscription.unsubscribe();
        subscription = watchQuery().subscribe(observer as any);
      });

      return {
        unsubscribe: () => {
          removeListener();
          subscription.unsubscribe();
        },
      };
    },
  } as ReturnType<typeof watchQuery>;
});

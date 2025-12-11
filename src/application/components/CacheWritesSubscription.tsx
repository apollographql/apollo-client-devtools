import { gql, type TypedDocumentNode } from "@apollo/client";
import { useSubscription } from "@apollo/client/react";
import type {
  CacheWritesSubscription,
  CacheWritesSubscriptionVariables,
  ClientWriteSubscriptionFragment,
} from "../types/gql";

interface Props {
  client: { __typename: "ClientV3" | "ClientV4"; id: string };
}

const CACHE_WRITES_SUBSCRIPTION: TypedDocumentNode<
  CacheWritesSubscription,
  CacheWritesSubscriptionVariables
> = gql`
  subscription CacheWritesSubscription($clientId: ID!) {
    cacheWritten(clientId: $clientId) {
      id
      ...CacheWritesPanelFragment
    }
  }
`;

export function CacheWritesSubscription({ client }: Props) {
  useSubscription(CACHE_WRITES_SUBSCRIPTION, {
    variables: { clientId: client.id },
    ignoreResults: true,
    onData: ({ client: { cache }, data: { data } }) => {
      if (!data) {
        return;
      }

      cache.writeFragment({
        id: cache.identify(client),
        fragment: gql`
          fragment ClientWriteSubscriptionFragment on Client {
            cacheWrites {
              ...CacheWritesPanelFragment
            }
          }
        ` as TypedDocumentNode<ClientWriteSubscriptionFragment>,
        data: {
          __typename: client.__typename,
          // the merge function handles concatenating this cache write with the
          // existing values
          cacheWrites: [data.cacheWritten],
        },
      });
    },
  });

  return null;
}

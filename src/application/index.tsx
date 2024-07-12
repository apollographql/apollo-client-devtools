import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Reference, TypedDocumentNode } from "@apollo/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
} from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";

import { colorTheme, listenForThemeChange } from "./theme";
import { App } from "./App";
import { fragmentRegistry } from "./fragmentRegistry";
import * as Tooltip from "@radix-ui/react-tooltip";

import { getRpcClient } from "../extension/devtools/panelRpcClient";
import { createSchemaWithRpcClient } from "./schema";
import type { ApolloClientInfo } from "../types";
import type { ClientFields } from "./types/gql";

const rpcClient = getRpcClient();
const schema = createSchemaWithRpcClient(rpcClient);
const link = new SchemaLink({ schema });

const cache = new InMemoryCache({
  fragments: fragmentRegistry,
  possibleTypes: {
    WatchedMutationError: ["SerializedError", "SerializedApolloError"],
  },
  typePolicies: {
    WatchedQuery: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    WatchedMutation: {
      fields: {
        name(_) {
          return _ ?? "(anonymous)";
        },
      },
    },
    Client: {
      fields: {
        cache: {
          merge: false,
        },
      },
    },
    ClientQueries: {
      merge: true,
    },
    ClientMutations: {
      merge: true,
    },
    SerializedApolloError: {
      keyFields: false,
    },
    SerializedGraphQLError: {
      keyFields: false,
    },
  },
});

export const client = new ApolloClient({ cache, link });

export const addClient = (clientData: ApolloClientInfo) => {
  client.cache.modify({
    id: "ROOT_QUERY",
    fields: {
      clients: (clients) => {
        const ref = client.writeFragment({
          fragment: gql`
            fragment ClientFields on Client {
              id
              version
              queries {
                total
              }
              mutations {
                total
              }
            }
          ` as TypedDocumentNode<ClientFields>,
          id: client.cache.identify({
            __typename: "Client",
            id: clientData.id,
          }),
          data: {
            __typename: "Client",
            id: clientData.id,
            version: clientData.version,
            queries: {
              __typename: "ClientQueries",
              total: clientData.queryCount,
            },
            mutations: {
              __typename: "ClientMutations",
              total: clientData.mutationCount,
            },
          },
        });

        return ref ? [...clients, ref] : clients;
      },
    },
  });
};

export const removeClient = (clientId: string) => {
  client.cache.modify({
    id: "ROOT_QUERY",
    fields: {
      clients: (clients, { readField }) => {
        return clients.filter(
          (client: Reference) => readField("id", client) !== clientId
        );
      },
    },
  });
};

export const AppProvider = () => {
  useEffect(() =>
    listenForThemeChange((newColorTheme) => colorTheme(newColorTheme))
  );

  return (
    <Tooltip.Provider delayDuration={0}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Tooltip.Provider>
  );
};

export const initDevTools = () => {
  const root = createRoot(document.getElementById("devtools") as HTMLElement);

  root.render(<AppProvider />);
};

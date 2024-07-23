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
import type {
  UpdateClientsQuery,
  UpdateClientsQueryVariables,
} from "./types/gql";

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
      keyFields: false,
      merge: true,
    },
    ClientMutations: {
      keyFields: false,
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

const UPDATE_CLIENTS_QUERY: TypedDocumentNode<
  UpdateClientsQuery,
  UpdateClientsQueryVariables
> = gql`
  query UpdateClientsQuery {
    clients {
      id
      name
      version
      queries {
        total
      }
      mutations {
        total
      }
    }
  }
`;

export const addClient = (clientData: ApolloClientInfo) => {
  const result = client.readQuery({ query: UPDATE_CLIENTS_QUERY });
  const clients = result?.clients ?? [];

  client.writeQuery({
    query: UPDATE_CLIENTS_QUERY,
    data: {
      clients: [
        ...clients,
        {
          __typename: "Client",
          id: clientData.id,
          name: clientData.name ?? null,
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
      ],
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

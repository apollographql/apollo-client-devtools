import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Reference } from "@apollo/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  makeVar,
  gql,
} from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";

import { colorTheme, listenForThemeChange } from "./theme";
import { App } from "./App";
import { fragmentRegistry } from "./fragmentRegistry";
import * as Tooltip from "@radix-ui/react-tooltip";

import type { JSONObject } from "./types/json";
import { getRpcClient } from "../extension/devtools/panelRpcClient";
import { createSchemaWithRpcClient } from "./schema";
import type { ApolloClientInfo } from "../types";

const rpcClient = getRpcClient(window);
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
    ClientQueries: {
      merge: true,
    },
    ClientMutations: {
      merge: true,
    },
    Query: {
      fields: {
        cache() {
          return cacheVar();
        },
      },
    },
    SerializedApolloError: {
      keyFields: false,
    },
    SerializedGraphQLError: {
      keyFields: false,
    },
  },
});

const cacheVar = makeVar<string | null>(null);
export const client = new ApolloClient({ cache, link });

export const writeData = ({
  clientVersion,
  cache,
}: {
  clientVersion: string | null;
  cache: JSONObject;
}) => {
  client.writeQuery({
    query: gql`
      query ClientVersion {
        clientVersion @client
      }
    `,
    data: {
      clientVersion,
    },
  });

  cacheVar(JSON.stringify(cache));
};

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
            }
          `,
          id: client.cache.identify({
            __typename: "Client",
            id: clientData.id,
          }),
          data: clientData,
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

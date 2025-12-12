import React from "react";
import type { Reference } from "@apollo/client-3";
import { ApolloClient, InMemoryCache, makeReference } from "@apollo/client-3";
import {
  useQuery,
  useLazyQuery,
  useMutation,
  ApolloProvider,
  useApolloClient,
} from "@apollo/client-3/react";

import type { ClientProvider } from "./ClientContext";
import { ClientContextProvider } from "./ClientContext";

export const createApolloClient3Provider = (
  name?: string
): { Provider: ClientProvider; client: ApolloClient<any> } => {
  const client = new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Color: {
          keyFields: ["hex"],
          fields: {
            saved: {
              read(_, { readField }) {
                const hex = readField("hex");
                const favoritedColors: ReadonlyArray<{
                  favoritedColors?: Reference[];
                }> =
                  readField("favoritedColors", makeReference("ROOT_QUERY")) ??
                  [];
                return favoritedColors.some((colorRef) => {
                  return hex === readField("hex", colorRef);
                });
              },
            },
          },
        },
      },
    }),
    uri: "http://localhost:4000",
    devtools: {
      enabled: true,
      name,
    },
  });
  return {
    client,
    Provider: ({ children }) => {
      return (
        <ClientContextProvider
          value={{
            useApolloClient: useApolloClient as any,
            useQuery: useQuery as any,
            useLazyQuery: useLazyQuery as any,
            useMutation: useMutation as any,
          }}
        >
          <ApolloProvider client={client}>{children}</ApolloProvider>
        </ClientContextProvider>
      );
    },
  };
};
createApolloClient3Provider.ClientClass = ApolloClient;

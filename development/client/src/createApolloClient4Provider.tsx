import React from "react";
import type { Reference } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import {
  useQuery,
  useLazyQuery,
  useMutation,
  ApolloProvider,
  useApolloClient,
} from "@apollo/client/react";

import { LocalState } from "@apollo/client/local-state";
import { Defer20220824Handler } from "@apollo/client/incremental";
import { makeReference } from "@apollo/client/utilities/internal";
import type { ClientProvider } from "./ClientContext";
import { ClientContextProvider } from "./ClientContext";

export const createApolloClient4Provider = (
  name?: string
): { Provider: ClientProvider; client: ApolloClient } => {
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

    link: ApolloLink.from([
      new ErrorLink((arg) => {
        console.log(name, "onError", arg);
      }),
      new HttpLink({ uri: "http://localhost:4000" }),
    ]),
    localState: new LocalState(),

    devtools: {
      enabled: true,
      name,
    },

    incrementalHandler: new Defer20220824Handler(),
  });
  return {
    client,
    Provider: ({ children }) => {
      return (
        <ClientContextProvider
          value={{
            useApolloClient,
            useQuery: useQuery,
            useLazyQuery: useLazyQuery,
            useMutation: useMutation,
          }}
        >
          <ApolloProvider client={client}>{children}</ApolloProvider>
        </ClientContextProvider>
      );
    },
  };
};
createApolloClient4Provider.ClientClass = ApolloClient;

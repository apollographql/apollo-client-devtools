import type { RpcClient } from "../extension/rpc";
import typeDefs from "./localSchema.graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { Resolvers } from "./types/resolvers";
import { getOperationName } from "@apollo/client/utilities/internal";
import { print } from "graphql";
import { gte } from "semver";

export function createSchemaWithRpcClient(rpcClient: RpcClient) {
  return makeExecutableSchema({
    typeDefs,
    resolvers: createResolvers(rpcClient),
  });
}

function createResolvers(client: RpcClient): Resolvers {
  const rpcClient = client.withTimeout(10_000);

  return {
    Query: {
      clients: () => rpcClient.request("getClients"),
      client: (_, { id }) => rpcClient.request("getClient", id),
    },
    Client: {
      cache: (client) => rpcClient.request("getCache", client.id),
      __resolveType: (client) => {
        return gte(client.version, "4.0.0") ? "ClientV4" : "ClientV3";
      },
    },
    ClientV3: {
      queries: (client) => client,
      mutations: (client) => client,
    },
    ClientV3Queries: {
      total: (client) => client.queryCount,
      items: async (client) => {
        const queries = await rpcClient.request("getQueries", client.id);

        return queries
          .map((query) => {
            const name = getOperationName(query.document);
            if (name === "IntrospectionQuery") {
              return;
            }

            return {
              id: query.id,
              name,
              queryString: print(query.document),
              variables: query.variables ?? null,
              cachedData: query.cachedData ?? null,
              options: query.options ?? null,
              networkStatus: query.networkStatus,
              error: query.error,
              pollInterval: query.pollInterval,
            };
          })
          .filter(Boolean);
      },
    },
    ClientV3Mutations: {
      total: (client) => client.mutationCount,
      items: async (client) => {
        const mutations = await rpcClient.request("getV3Mutations", client.id);

        return mutations.map((mutation, index) => ({
          id: String(index),
          name: getOperationName(mutation.document),
          mutationString: print(mutation.document),
          variables: mutation.variables ?? null,
          loading: mutation.loading,
          error: mutation.error,
        }));
      },
    },
    ClientV3WatchedMutationError: {
      __resolveType: (error) => {
        if (error.name === "ApolloError") {
          return "SerializedApolloError";
        }

        return "SerializedError";
      },
    },
    ClientV4Mutations: {
      total: (client) => client.mutationCount,
      items: async (client) => {
        const mutations = await rpcClient.request("getV4Mutations", client.id);

        return mutations.map((mutation, index) => ({
          id: String(index),
          name: getOperationName(mutation.document),
          loading: mutation.loading,
          mutationString: print(mutation.document),
          variables: mutation.variables ?? null,
          error: mutation.error,
        }));
      },
    },
    ClientV4Error: {
      __resolveType: (error) => {
        switch (error.name) {
          case "CombinedGraphQLErrors":
            return "SerializedCombinedGraphQLErrors";
          case "CombinedProtocolErrors":
            return "SerializedCombinedProtocolErrors";
          case "LocalStateError":
            return "SerializedLocalStateError";
          case "ServerError":
            return "SerializedServerError";
          case "ServerParserError":
            return "SerializedServerParseError";
          case "UnconventionalError":
            return "SerializedUnconventionalError";
          default:
            return "SerializedError";
        }
      },
    },
  };
}

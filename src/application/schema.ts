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
      __resolveType: (client) => {
        return gte(client.version, "4.0.0") ? "ClientV4" : "ClientV3";
      },
    },
    ClientV3: {
      cache: (client) => rpcClient.request("getCache", client.id),
      queries: (client) => client,
      mutations: (client) => client,
    },
    ClientV4: {
      cache: (client) => rpcClient.request("getCache", client.id),
      queries: (client) => client,
      mutations: (client) => client,
    },
    ClientQueries: {
      __resolveType: (client) => {
        return gte(client.version, "4.0.0")
          ? "ClientV4Queries"
          : "ClientV3Queries";
      },
    },
    ClientMutations: {
      __resolveType: (client) => {
        return gte(client.version, "4.0.0")
          ? "ClientV4Mutations"
          : "ClientV3Mutations";
      },
    },
    ClientV3Queries: {
      total: (client) => client.queryCount,
      items: async (client) => {
        const queries = await rpcClient.request("getV3Queries", client.id);

        return queries.map((query) => {
          return {
            id: query.id,
            name: getOperationName(query.document),
            queryString: print(query.document),
            variables: query.variables ?? null,
            cachedData: query.cachedData ?? null,
            options: query.options ?? null,
            networkStatus: query.networkStatus,
            error: query.error,
            pollInterval: query.pollInterval,
          };
        });
      },
    },
    ClientV4Queries: {
      total: (client) => client.queryCount,
      items: async (client) => {
        const queries = await rpcClient.request("getV4Queries", client.id);

        return queries.map((query) => {
          return {
            id: query.id,
            name: getOperationName(query.document),
            queryString: print(query.document),
            variables: query.variables ?? null,
            cachedData: query.cachedData ?? null,
            options: query.options ?? null,
            networkStatus: query.networkStatus,
            error: query.error,
            pollInterval: query.pollInterval,
          };
        });
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
    ClientV3MutationError: {
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
    ErrorLike: {
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

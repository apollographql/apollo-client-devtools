import type { DevtoolsRPCMessage } from "../extension/messages";
import type { RpcClient } from "../extension/rpc";
import typeDefs from "./localSchema.graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { Resolvers } from "./types/resolvers";
import { getQueryData } from ".";
import { getOperationName } from "@apollo/client/utilities";
import { print } from "graphql";

export function createSchemaWithRpcClient(
  rpcClient: RpcClient<DevtoolsRPCMessage>
) {
  return makeExecutableSchema({
    typeDefs,
    resolvers: createResolvers(rpcClient),
  });
}

function createResolvers(rpcClient: RpcClient<DevtoolsRPCMessage>): Resolvers {
  return {
    Query: {
      clients: () => rpcClient.request("getClients"),
      client: (_, { id }) => rpcClient.request("getClient", id),
    },
    Client: {
      queries: (client) => client,
      mutations: (client) => client,
    },
    ClientQueries: {
      total: (client) => client.queryCount,
      items: async (client) => {
        const queries = await rpcClient.request("getQueries", client.id);

        return queries.map(getQueryData).filter(Boolean);
      },
    },
    ClientMutations: {
      total: (client) => client.mutationCount,
      items: async (client) => {
        const queries = await rpcClient.request("getMutations", client.id);

        return queries.map((mutation, index) => ({
          id: String(index),
          __typename: "WatchedMutation",
          name: getOperationName(mutation.document),
          mutationString: print(mutation.document),
          variables: mutation.variables ?? null,
        }));
      },
    },
  };
}

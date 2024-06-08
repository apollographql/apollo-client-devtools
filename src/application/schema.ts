import type { DevtoolsRPCMessage } from "../extension/messages";
import type { RpcClient } from "../extension/rpc";
import typeDefs from "./localSchema.graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { Resolvers } from "./types/resolvers";

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
    },
  };
}

import type { RpcClient } from "../extension/rpc";
import typeDefs from "./localSchema.graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type {
  Resolvers,
  PersistedQueryLinkCacheSizes,
  RemoveTypenameFromVariablesLinkCacheSizes,
  MemoryInternalsCaches,
} from "./types/resolvers";
import { getOperationName } from "@apollo/client/utilities/internal";
import { print } from "graphql";
import { gte } from "semver";
import type { MemoryInternalsV3 } from "@/extension/tab/v3/types";
import type { MemoryInternalsV4 } from "@/extension/tab/v4/types";

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
      memoryInternals: async (client) => {
        const memoryInternals = await rpcClient.request(
          "getV3MemoryInternals",
          client.id
        );

        if (!memoryInternals) {
          return null;
        }

        const { sizes, limits } = memoryInternals;

        return {
          raw: memoryInternals,
          caches: {
            ...formatMemoryInternalsCaches(memoryInternals),
            parser: getCacheSize("parser", sizes.parser, limits),
          },
        };
      },
    },
    ClientV4: {
      cache: (client) => rpcClient.request("getCache", client.id),
      queries: (client) => client,
      mutations: (client) => client,
      memoryInternals: async (client) => {
        const memoryInternals = await rpcClient.request(
          "getV4MemoryInternals",
          client.id
        );

        if (!memoryInternals) {
          return null;
        }

        return {
          raw: memoryInternals,
          caches: formatMemoryInternalsCaches(memoryInternals),
        };
      },
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

type MemoryLimits = Record<string, number | undefined>;

function getCacheSize(
  key: string,
  size: number | undefined,
  limits: MemoryLimits
) {
  return { key, size: size ?? null, limit: limits[key] ?? null };
}

function getDocumentTransformCacheSizes(
  caches: Array<{ cache: number }>,
  limits: MemoryLimits
) {
  return caches.map(({ cache }) => ({
    cache: getCacheSize("documentTransform.cache", cache, limits),
  }));
}

interface PersistedQueryLinkCache {
  PersistedQueryLink: {
    persistedQueryHashes: number;
  };
}

function isPersistedQueryLinkCache(
  cache: unknown
): cache is PersistedQueryLinkCache {
  return (
    typeof cache === "object" && cache !== null && "PersistedQueryLink" in cache
  );
}

interface RemoveTypenameFromVariablesLinkCache {
  removeTypenameFromVariables: {
    getVariableDefinitions: number;
  };
}

function isRemoveTypenameFromVariablesLinkCache(
  cache: unknown
): cache is RemoveTypenameFromVariablesLinkCache {
  return (
    typeof cache === "object" &&
    cache !== null &&
    "removeTypenameFromVariables" in cache
  );
}

function getLinkCacheSize(
  linkCache: unknown,
  limits: MemoryLimits
):
  | PersistedQueryLinkCacheSizes
  | RemoveTypenameFromVariablesLinkCacheSizes
  | null {
  if (isPersistedQueryLinkCache(linkCache)) {
    return {
      __typename: "PersistedQueryLinkCacheSizes",
      persistedQueryHashes: getCacheSize(
        "PersistedQueryLink.persistedQueryHashes",
        linkCache.PersistedQueryLink.persistedQueryHashes,
        limits
      ),
    } satisfies PersistedQueryLinkCacheSizes;
  }

  if (isRemoveTypenameFromVariablesLinkCache(linkCache)) {
    return {
      __typename: "RemoveTypenameFromVariablesLinkCacheSizes",
      getVariableDefinitions: getCacheSize(
        "removeTypenameFromVariables.getVariableDefinitions",
        linkCache.removeTypenameFromVariables.getVariableDefinitions,
        limits
      ),
    } satisfies RemoveTypenameFromVariablesLinkCacheSizes;
  }

  return null;
}

function formatMemoryInternalsCaches(
  memoryInternals: MemoryInternalsV3 | MemoryInternalsV4
): MemoryInternalsCaches {
  const { sizes, limits } = memoryInternals;

  return {
    print: getCacheSize("print", sizes.print, limits),
    canonicalStringify: getCacheSize(
      "canonicalStringify",
      sizes.canonicalStringify,
      limits
    ),
    links: sizes.links
      .map((linkCache) => getLinkCacheSize(linkCache, limits))
      .filter(Boolean),
    queryManager: {
      getDocumentInfo: getCacheSize(
        "queryManager.getDocumentInfo",
        sizes.queryManager.getDocumentInfo,
        limits
      ),
      documentTransforms: getDocumentTransformCacheSizes(
        sizes.queryManager.documentTransforms,
        limits
      ),
    },
    fragmentRegistry: {
      lookup: getCacheSize(
        "fragmentRegistry.lookup",
        sizes.fragmentRegistry?.lookup,
        limits
      ),
      findFragmentSpreads: getCacheSize(
        "fragmentRegistry.findFragmentSpreads",
        sizes.fragmentRegistry?.findFragmentSpreads,
        limits
      ),
      transform: getCacheSize(
        "fragmentRegistry.transform",
        sizes.fragmentRegistry?.transform,
        limits
      ),
    },
    cache: {
      fragmentQueryDocuments: getCacheSize(
        "cache.fragmentQueryDocuments",
        sizes.cache?.fragmentQueryDocuments,
        limits
      ),
    },
    addTypenameDocumentTransform: sizes.addTypenameDocumentTransform
      ? getDocumentTransformCacheSizes(
          sizes.addTypenameDocumentTransform,
          limits
        )
      : null,
    inMemoryCache: {
      maybeBroadcastWatch: getCacheSize(
        "inMemoryCache.maybeBroadcastWatch",
        sizes.inMemoryCache?.maybeBroadcastWatch,
        limits
      ),
      executeSelectionSet: getCacheSize(
        "inMemoryCache.executeSelectionSet",
        sizes.inMemoryCache?.executeSelectionSet,
        limits
      ),
      executeSubSelectedArray: getCacheSize(
        "inMemoryCache.executeSubSelectedArray",
        sizes.inMemoryCache?.executeSubSelectedArray,
        limits
      ),
    },
  };
}

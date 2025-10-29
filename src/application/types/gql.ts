import type { Cache } from "./scalars";
import type { DateTime } from "./scalars";
import type { Diff } from "@/application/utilities/diff";
import type { GraphQLErrorPath } from "./scalars";
import type { JSON } from "./scalars";
import type { QueryData } from "./scalars";
import type { QueryOptions } from "./scalars";
import type { Variables } from "./scalars";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Represents JSON cache data */
  Cache: { input: Cache; output: Cache };
  DateTime: { input: DateTime; output: DateTime };
  Diff: { input: Diff; output: Diff };
  GraphQLErrorPath: { input: GraphQLErrorPath; output: GraphQLErrorPath };
  JSON: { input: JSON; output: JSON };
  /** Represents data for a specific query */
  QueryData: { input: QueryData; output: QueryData };
  /** Represents options for a query */
  QueryOptions: { input: QueryOptions; output: QueryOptions };
  /** Represents variables for a query */
  Variables: { input: Variables; output: Variables };
};

export type BaseCacheSizes = {
  __typename: "BaseCacheSizes";
  fragmentQueryDocuments: CacheSize;
};

export type CacheSize = {
  __typename: "CacheSize";
  key: Scalars["String"]["output"];
  limit: Maybe<Scalars["Int"]["output"]>;
  size: Maybe<Scalars["Int"]["output"]>;
};

export type CacheWrite = {
  __typename: "CacheWrite";
  broadcast: Maybe<Scalars["Boolean"]["output"]>;
  cacheDiff: Maybe<Scalars["Diff"]["output"]>;
  data: Maybe<Scalars["QueryData"]["output"]>;
  dataId: Maybe<Scalars["String"]["output"]>;
  documentString: Scalars["String"]["output"];
  overwrite: Maybe<Scalars["Boolean"]["output"]>;
  timestamp: Maybe<Scalars["DateTime"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type Client = {
  cache: Scalars["Cache"]["output"];
  cacheWrites: Array<CacheWrite>;
  id: Scalars["String"]["output"];
  memoryInternals: Maybe<MemoryInternals>;
  mutations: ClientMutations;
  name: Maybe<Scalars["String"]["output"]>;
  queries: ClientQueries;
  version: Scalars["String"]["output"];
};

export type ClientMutation = {
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientMutations = {
  items: Array<ClientMutation>;
  total: Scalars["Int"]["output"];
};

export type ClientQueries = {
  items: Array<ClientWatchedQuery>;
  total: Scalars["Int"]["output"];
};

export type ClientV3 = Client & {
  __typename: "ClientV3";
  cache: Scalars["Cache"]["output"];
  cacheWrites: Array<CacheWrite>;
  id: Scalars["String"]["output"];
  memoryInternals: Maybe<ClientV3MemoryInternals>;
  mutations: ClientV3Mutations;
  name: Maybe<Scalars["String"]["output"]>;
  queries: ClientV3Queries;
  version: Scalars["String"]["output"];
};

export type ClientV3MemoryInternals = MemoryInternals & {
  __typename: "ClientV3MemoryInternals";
  caches: ClientV3MemoryInternalsCaches;
  raw: Maybe<Scalars["JSON"]["output"]>;
};

export type ClientV3MemoryInternalsCaches = MemoryInternalsCaches & {
  __typename: "ClientV3MemoryInternalsCaches";
  addTypenameDocumentTransform: Maybe<Array<DocumentTransformCacheSizes>>;
  cache: BaseCacheSizes;
  canonicalStringify: CacheSize;
  fragmentRegistry: FragmentRegistryCacheSizes;
  inMemoryCache: InMemoryCacheSizes;
  links: Array<LinkCacheSize>;
  parser: CacheSize;
  print: CacheSize;
  queryManager: QueryManagerCacheSizes;
};

export type ClientV3Mutation = ClientMutation & {
  __typename: "ClientV3Mutation";
  error: Maybe<ClientV3MutationError>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientV3MutationError = SerializedApolloError | SerializedError;

export type ClientV3Mutations = ClientMutations & {
  __typename: "ClientV3Mutations";
  items: Array<ClientV3Mutation>;
  total: Scalars["Int"]["output"];
};

export type ClientV3Queries = ClientQueries & {
  __typename: "ClientV3Queries";
  items: Array<ClientV3WatchedQuery>;
  total: Scalars["Int"]["output"];
};

export type ClientV3WatchedQueries = {
  __typename: "ClientV3WatchedQueries";
  count: Scalars["Int"]["output"];
  queries: Array<ClientV3WatchedQuery>;
};

export type ClientV3WatchedQuery = ClientWatchedQuery & {
  __typename: "ClientV3WatchedQuery";
  cachedData: Maybe<Scalars["QueryData"]["output"]>;
  error: Maybe<SerializedApolloError>;
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  networkStatus: Scalars["Int"]["output"];
  options: Maybe<Scalars["QueryOptions"]["output"]>;
  pollInterval: Maybe<Scalars["Int"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientV4 = Client & {
  __typename: "ClientV4";
  cache: Scalars["Cache"]["output"];
  cacheWrites: Array<CacheWrite>;
  id: Scalars["String"]["output"];
  memoryInternals: Maybe<ClientV4MemoryInternals>;
  mutations: ClientV4Mutations;
  name: Maybe<Scalars["String"]["output"]>;
  queries: ClientV4Queries;
  version: Scalars["String"]["output"];
};

export type ClientV4MemoryInternals = MemoryInternals & {
  __typename: "ClientV4MemoryInternals";
  caches: ClientV4MemoryInternalsCaches;
  raw: Maybe<Scalars["JSON"]["output"]>;
};

export type ClientV4MemoryInternalsCaches = MemoryInternalsCaches & {
  __typename: "ClientV4MemoryInternalsCaches";
  addTypenameDocumentTransform: Maybe<Array<DocumentTransformCacheSizes>>;
  cache: BaseCacheSizes;
  canonicalStringify: CacheSize;
  fragmentRegistry: FragmentRegistryCacheSizes;
  inMemoryCache: InMemoryCacheSizes;
  links: Array<LinkCacheSize>;
  print: CacheSize;
  queryManager: QueryManagerCacheSizes;
};

export type ClientV4Mutation = ClientMutation & {
  __typename: "ClientV4Mutation";
  error: Maybe<ErrorLike>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientV4Mutations = ClientMutations & {
  __typename: "ClientV4Mutations";
  items: Array<ClientV4Mutation>;
  total: Scalars["Int"]["output"];
};

export type ClientV4Queries = ClientQueries & {
  __typename: "ClientV4Queries";
  items: Array<ClientV4WatchedQuery>;
  total: Scalars["Int"]["output"];
};

export type ClientV4WatchedQuery = ClientWatchedQuery & {
  __typename: "ClientV4WatchedQuery";
  cachedData: Maybe<Scalars["QueryData"]["output"]>;
  error: Maybe<ErrorLike>;
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  networkStatus: Scalars["Int"]["output"];
  options: Maybe<Scalars["QueryOptions"]["output"]>;
  pollInterval: Maybe<Scalars["Int"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientWatchedQuery = {
  cachedData: Maybe<Scalars["QueryData"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  networkStatus: Scalars["Int"]["output"];
  options: Maybe<Scalars["QueryOptions"]["output"]>;
  pollInterval: Maybe<Scalars["Int"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type DocumentTransformCacheSizes = {
  __typename: "DocumentTransformCacheSizes";
  cache: CacheSize;
};

export type ErrorLike = {
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type FragmentRegistryCacheSizes = {
  __typename: "FragmentRegistryCacheSizes";
  findFragmentSpreads: CacheSize;
  lookup: CacheSize;
  transform: CacheSize;
};

export type GraphQLErrorSourceLocation = {
  __typename: "GraphQLErrorSourceLocation";
  column: Scalars["Int"]["output"];
  line: Scalars["Int"]["output"];
};

export type InMemoryCacheSizes = {
  __typename: "InMemoryCacheSizes";
  executeSelectionSet: CacheSize;
  executeSubSelectedArray: CacheSize;
  maybeBroadcastWatch: CacheSize;
};

export type LinkCacheSize =
  | PersistedQueryLinkCacheSizes
  | RemoveTypenameFromVariablesLinkCacheSizes;

export type MemoryInternals = {
  caches: Maybe<MemoryInternalsCaches>;
  raw: Maybe<Scalars["JSON"]["output"]>;
};

export type MemoryInternalsCaches = {
  addTypenameDocumentTransform: Maybe<Array<DocumentTransformCacheSizes>>;
  cache: BaseCacheSizes;
  canonicalStringify: CacheSize;
  fragmentRegistry: FragmentRegistryCacheSizes;
  inMemoryCache: InMemoryCacheSizes;
  links: Array<LinkCacheSize>;
  print: CacheSize;
  queryManager: QueryManagerCacheSizes;
};

export type PersistedQueryLinkCacheSizes = {
  __typename: "PersistedQueryLinkCacheSizes";
  persistedQueryHashes: CacheSize;
};

export type Query = {
  __typename: "Query";
  client: Maybe<Client>;
  clients: Array<Client>;
};

export type QueryclientArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryManagerCacheSizes = {
  __typename: "QueryManagerCacheSizes";
  documentTransforms: Maybe<Array<DocumentTransformCacheSizes>>;
  getDocumentInfo: CacheSize;
};

export type RemoveTypenameFromVariablesLinkCacheSizes = {
  __typename: "RemoveTypenameFromVariablesLinkCacheSizes";
  getVariableDefinitions: CacheSize;
};

export type SerializedApolloError = {
  __typename: "SerializedApolloError";
  clientErrors: Array<Scalars["String"]["output"]>;
  graphQLErrors: Array<SerializedGraphQLError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  networkError: Maybe<SerializedError>;
  protocolErrors: Array<Scalars["String"]["output"]>;
};

export type SerializedCombinedGraphQLErrors = ErrorLike & {
  __typename: "SerializedCombinedGraphQLErrors";
  data: Maybe<Scalars["QueryData"]["output"]>;
  errors: Array<SerializedGraphQLError>;
  extensions: Maybe<Scalars["JSON"]["output"]>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedCombinedProtocolErrors = ErrorLike & {
  __typename: "SerializedCombinedProtocolErrors";
  errors: Array<SerializedGraphQLError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedError = ErrorLike & {
  __typename: "SerializedError";
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedGraphQLError = {
  __typename: "SerializedGraphQLError";
  extensions: Maybe<Scalars["JSON"]["output"]>;
  locations: Maybe<Array<GraphQLErrorSourceLocation>>;
  message: Scalars["String"]["output"];
  path: Maybe<Scalars["GraphQLErrorPath"]["output"]>;
};

export type SerializedLocalStateError = ErrorLike & {
  __typename: "SerializedLocalStateError";
  cause: Maybe<SerializedError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  path: Maybe<Scalars["GraphQLErrorPath"]["output"]>;
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedServerError = ErrorLike & {
  __typename: "SerializedServerError";
  bodyText: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
  statusCode: Scalars["Int"]["output"];
};

export type SerializedServerParseError = ErrorLike & {
  __typename: "SerializedServerParseError";
  bodyText: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
  statusCode: Scalars["Int"]["output"];
};

export type SerializedUnconventionalError = ErrorLike & {
  __typename: "SerializedUnconventionalError";
  cause: Maybe<Scalars["JSON"]["output"]>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type Subscription = {
  __typename: "Subscription";
  cacheWritten: CacheWrite;
};

export type SubscriptioncacheWrittenArgs = {
  clientId: Scalars["ID"]["input"];
};

export type AppQueryVariables = Exact<{ [key: string]: never }>;

export type AppQuery = {
  clients: Array<
    | { __typename: "ClientV3"; id: string; name: string | null }
    | { __typename: "ClientV4"; id: string; name: string | null }
  >;
};

export type ClientQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type ClientQuery = {
  client:
    | {
        __typename: "ClientV3";
        id: string;
        version: string;
        queries: { __typename: "ClientV3Queries"; total: number };
        mutations: { __typename: "ClientV3Mutations"; total: number };
      }
    | {
        __typename: "ClientV4";
        id: string;
        version: string;
        queries: { __typename: "ClientV4Queries"; total: number };
        mutations: { __typename: "ClientV4Mutations"; total: number };
      }
    | null;
};

export type ApolloErrorAlertDisclosurePanel_error = {
  __typename: "SerializedApolloError";
  clientErrors: Array<string>;
  protocolErrors: Array<string>;
  networkError: {
    __typename: "SerializedError";
    message: string;
    name: string;
    stack: string | null;
  } | null;
  graphQLErrors: Array<{
    __typename: "SerializedGraphQLError";
    message: string;
    path: GraphQLErrorPath | null;
    extensions: JSON | null;
  }>;
};

export type GetCacheVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetCache = {
  client:
    | {
        __typename: "ClientV3";
        id: string;
        cache: Cache;
        cacheWrites: Array<{
          __typename: "CacheWrite";
          data: QueryData | null;
          documentString: string;
          cacheDiff: Diff | null;
        }>;
      }
    | {
        __typename: "ClientV4";
        id: string;
        cache: Cache;
        cacheWrites: Array<{
          __typename: "CacheWrite";
          data: QueryData | null;
          documentString: string;
          cacheDiff: Diff | null;
        }>;
      }
    | null;
};

export type CacheWritesVariables = Exact<{
  clientId: Scalars["ID"]["input"];
}>;

export type CacheWrites = {
  cacheWritten: {
    __typename: "CacheWrite";
    data: QueryData | null;
    documentString: string;
    cacheDiff: Diff | null;
  };
};

export type CombinedGraphQLErrorsAlertDisclosurePanel_error = {
  __typename: "SerializedCombinedGraphQLErrors";
  errors: Array<{
    __typename: "SerializedGraphQLError";
    message: string;
    path: GraphQLErrorPath | null;
    extensions: JSON | null;
  }>;
};

export type CombinedProtocolErrorsAlertDisclosurePanel_error = {
  __typename: "SerializedCombinedProtocolErrors";
  errors: Array<{ __typename: "SerializedGraphQLError"; message: string }>;
};

export type MemoryInternalsQueryVariables = Exact<{
  clientId: Scalars["ID"]["input"];
}>;

export type MemoryInternalsQuery = {
  client:
    | {
        __typename: "ClientV3";
        id: string;
        version: string;
        memoryInternals: {
          __typename: "ClientV3MemoryInternals";
          raw: JSON | null;
          caches: {
            __typename: "ClientV3MemoryInternalsCaches";
            parser: {
              __typename: "CacheSize";
              key: string;
              size: number | null;
              limit: number | null;
            };
            print: {
              __typename: "CacheSize";
              key: string;
              size: number | null;
              limit: number | null;
            };
            canonicalStringify: {
              __typename: "CacheSize";
              key: string;
              size: number | null;
              limit: number | null;
            };
            links: Array<
              | {
                  __typename: "PersistedQueryLinkCacheSizes";
                  persistedQueryHashes: {
                    __typename: "CacheSize";
                    key: string;
                    size: number | null;
                    limit: number | null;
                  };
                }
              | {
                  __typename: "RemoveTypenameFromVariablesLinkCacheSizes";
                  getVariableDefinitions: {
                    __typename: "CacheSize";
                    key: string;
                    size: number | null;
                    limit: number | null;
                  };
                }
            >;
            queryManager: {
              __typename: "QueryManagerCacheSizes";
              getDocumentInfo: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              documentTransforms: Array<{
                __typename: "DocumentTransformCacheSizes";
                cache: {
                  __typename: "CacheSize";
                  key: string;
                  size: number | null;
                  limit: number | null;
                };
              }> | null;
            };
            fragmentRegistry: {
              __typename: "FragmentRegistryCacheSizes";
              lookup: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              findFragmentSpreads: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              transform: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            };
            cache: {
              __typename: "BaseCacheSizes";
              fragmentQueryDocuments: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            };
            addTypenameDocumentTransform: Array<{
              __typename: "DocumentTransformCacheSizes";
              cache: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            }> | null;
            inMemoryCache: {
              __typename: "InMemoryCacheSizes";
              maybeBroadcastWatch: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              executeSelectionSet: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              executeSubSelectedArray: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            };
          };
        } | null;
      }
    | {
        __typename: "ClientV4";
        id: string;
        version: string;
        memoryInternals: {
          __typename: "ClientV4MemoryInternals";
          raw: JSON | null;
          caches: {
            __typename: "ClientV4MemoryInternalsCaches";
            print: {
              __typename: "CacheSize";
              key: string;
              size: number | null;
              limit: number | null;
            };
            canonicalStringify: {
              __typename: "CacheSize";
              key: string;
              size: number | null;
              limit: number | null;
            };
            links: Array<
              | {
                  __typename: "PersistedQueryLinkCacheSizes";
                  persistedQueryHashes: {
                    __typename: "CacheSize";
                    key: string;
                    size: number | null;
                    limit: number | null;
                  };
                }
              | {
                  __typename: "RemoveTypenameFromVariablesLinkCacheSizes";
                  getVariableDefinitions: {
                    __typename: "CacheSize";
                    key: string;
                    size: number | null;
                    limit: number | null;
                  };
                }
            >;
            queryManager: {
              __typename: "QueryManagerCacheSizes";
              getDocumentInfo: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              documentTransforms: Array<{
                __typename: "DocumentTransformCacheSizes";
                cache: {
                  __typename: "CacheSize";
                  key: string;
                  size: number | null;
                  limit: number | null;
                };
              }> | null;
            };
            fragmentRegistry: {
              __typename: "FragmentRegistryCacheSizes";
              lookup: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              findFragmentSpreads: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              transform: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            };
            cache: {
              __typename: "BaseCacheSizes";
              fragmentQueryDocuments: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            };
            addTypenameDocumentTransform: Array<{
              __typename: "DocumentTransformCacheSizes";
              cache: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            }> | null;
            inMemoryCache: {
              __typename: "InMemoryCacheSizes";
              maybeBroadcastWatch: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              executeSelectionSet: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
              executeSubSelectedArray: {
                __typename: "CacheSize";
                key: string;
                size: number | null;
                limit: number | null;
              };
            };
          };
        } | null;
      }
    | null;
};

export type CacheSizeFields = {
  __typename: "CacheSize";
  key: string;
  size: number | null;
  limit: number | null;
};

export type GetMutationsVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetMutations = {
  client:
    | {
        __typename: "ClientV3";
        id: string;
        mutations: {
          __typename: "ClientV3Mutations";
          total: number;
          items: Array<{
            __typename: "ClientV3Mutation";
            id: string;
            name: string | null;
            mutationString: string;
            variables: Variables | null;
            loading: boolean;
            error:
              | {
                  __typename: "SerializedApolloError";
                  clientErrors: Array<string>;
                  protocolErrors: Array<string>;
                  networkError: {
                    __typename: "SerializedError";
                    message: string;
                    name: string;
                    stack: string | null;
                  } | null;
                  graphQLErrors: Array<{
                    __typename: "SerializedGraphQLError";
                    message: string;
                    path: GraphQLErrorPath | null;
                    extensions: JSON | null;
                  }>;
                }
              | {
                  __typename: "SerializedError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | null;
          }>;
        };
      }
    | {
        __typename: "ClientV4";
        id: string;
        mutations: {
          __typename: "ClientV4Mutations";
          total: number;
          items: Array<{
            __typename: "ClientV4Mutation";
            id: string;
            name: string | null;
            mutationString: string;
            variables: Variables | null;
            loading: boolean;
            error:
              | {
                  __typename: "SerializedCombinedGraphQLErrors";
                  message: string;
                  name: string;
                  stack: string | null;
                  errors: Array<{
                    __typename: "SerializedGraphQLError";
                    message: string;
                    path: GraphQLErrorPath | null;
                    extensions: JSON | null;
                  }>;
                }
              | {
                  __typename: "SerializedCombinedProtocolErrors";
                  message: string;
                  name: string;
                  stack: string | null;
                  errors: Array<{
                    __typename: "SerializedGraphQLError";
                    message: string;
                  }>;
                }
              | {
                  __typename: "SerializedError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedLocalStateError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedServerError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedServerParseError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedUnconventionalError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | null;
          }>;
        };
      }
    | null;
};

export type GetQueriesVariables = Exact<{
  clientId: Scalars["ID"]["input"];
}>;

export type GetQueries = {
  client:
    | {
        __typename: "ClientV3";
        id: string;
        queries: {
          __typename: "ClientV3Queries";
          items: Array<{
            __typename: "ClientV3WatchedQuery";
            id: string;
            name: string | null;
            queryString: string;
            variables: Variables | null;
            cachedData: QueryData | null;
            options: QueryOptions | null;
            networkStatus: number;
            pollInterval: number | null;
            error: {
              __typename: "SerializedApolloError";
              clientErrors: Array<string>;
              protocolErrors: Array<string>;
              networkError: {
                __typename: "SerializedError";
                message: string;
                name: string;
                stack: string | null;
              } | null;
              graphQLErrors: Array<{
                __typename: "SerializedGraphQLError";
                message: string;
                path: GraphQLErrorPath | null;
                extensions: JSON | null;
              }>;
            } | null;
          }>;
        };
      }
    | {
        __typename: "ClientV4";
        id: string;
        queries: {
          __typename: "ClientV4Queries";
          items: Array<{
            __typename: "ClientV4WatchedQuery";
            id: string;
            name: string | null;
            queryString: string;
            variables: Variables | null;
            cachedData: QueryData | null;
            options: QueryOptions | null;
            networkStatus: number;
            pollInterval: number | null;
            error:
              | {
                  __typename: "SerializedCombinedGraphQLErrors";
                  message: string;
                  name: string;
                  stack: string | null;
                  errors: Array<{
                    __typename: "SerializedGraphQLError";
                    message: string;
                    path: GraphQLErrorPath | null;
                    extensions: JSON | null;
                  }>;
                }
              | {
                  __typename: "SerializedCombinedProtocolErrors";
                  message: string;
                  name: string;
                  stack: string | null;
                  errors: Array<{
                    __typename: "SerializedGraphQLError";
                    message: string;
                  }>;
                }
              | {
                  __typename: "SerializedError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedLocalStateError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedServerError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedServerParseError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | {
                  __typename: "SerializedUnconventionalError";
                  message: string;
                  name: string;
                  stack: string | null;
                }
              | null;
          }>;
        };
      }
    | null;
};

type SerializedErrorAlertDisclosureItem_error_SerializedCombinedGraphQLErrors =
  {
    __typename: "SerializedCombinedGraphQLErrors";
    message: string;
    name: string;
    stack: string | null;
  };

type SerializedErrorAlertDisclosureItem_error_SerializedCombinedProtocolErrors =
  {
    __typename: "SerializedCombinedProtocolErrors";
    message: string;
    name: string;
    stack: string | null;
  };

type SerializedErrorAlertDisclosureItem_error_SerializedError = {
  __typename: "SerializedError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosureItem_error_SerializedLocalStateError = {
  __typename: "SerializedLocalStateError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosureItem_error_SerializedServerError = {
  __typename: "SerializedServerError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosureItem_error_SerializedServerParseError = {
  __typename: "SerializedServerParseError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosureItem_error_SerializedUnconventionalError = {
  __typename: "SerializedUnconventionalError";
  message: string;
  name: string;
  stack: string | null;
};

export type SerializedErrorAlertDisclosureItem_error =
  | SerializedErrorAlertDisclosureItem_error_SerializedCombinedGraphQLErrors
  | SerializedErrorAlertDisclosureItem_error_SerializedCombinedProtocolErrors
  | SerializedErrorAlertDisclosureItem_error_SerializedError
  | SerializedErrorAlertDisclosureItem_error_SerializedLocalStateError
  | SerializedErrorAlertDisclosureItem_error_SerializedServerError
  | SerializedErrorAlertDisclosureItem_error_SerializedServerParseError
  | SerializedErrorAlertDisclosureItem_error_SerializedUnconventionalError;

type SerializedErrorAlertDisclosurePanel_error_SerializedCombinedGraphQLErrors =
  {
    __typename: "SerializedCombinedGraphQLErrors";
    message: string;
    name: string;
    stack: string | null;
    errors: Array<{
      __typename: "SerializedGraphQLError";
      message: string;
      path: GraphQLErrorPath | null;
      extensions: JSON | null;
    }>;
  };

type SerializedErrorAlertDisclosurePanel_error_SerializedCombinedProtocolErrors =
  {
    __typename: "SerializedCombinedProtocolErrors";
    message: string;
    name: string;
    stack: string | null;
    errors: Array<{ __typename: "SerializedGraphQLError"; message: string }>;
  };

type SerializedErrorAlertDisclosurePanel_error_SerializedError = {
  __typename: "SerializedError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosurePanel_error_SerializedLocalStateError = {
  __typename: "SerializedLocalStateError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosurePanel_error_SerializedServerError = {
  __typename: "SerializedServerError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosurePanel_error_SerializedServerParseError = {
  __typename: "SerializedServerParseError";
  message: string;
  name: string;
  stack: string | null;
};

type SerializedErrorAlertDisclosurePanel_error_SerializedUnconventionalError = {
  __typename: "SerializedUnconventionalError";
  message: string;
  name: string;
  stack: string | null;
};

export type SerializedErrorAlertDisclosurePanel_error =
  | SerializedErrorAlertDisclosurePanel_error_SerializedCombinedGraphQLErrors
  | SerializedErrorAlertDisclosurePanel_error_SerializedCombinedProtocolErrors
  | SerializedErrorAlertDisclosurePanel_error_SerializedError
  | SerializedErrorAlertDisclosurePanel_error_SerializedLocalStateError
  | SerializedErrorAlertDisclosurePanel_error_SerializedServerError
  | SerializedErrorAlertDisclosurePanel_error_SerializedServerParseError
  | SerializedErrorAlertDisclosurePanel_error_SerializedUnconventionalError;

export type ClientCountVariables = Exact<{ [key: string]: never }>;

export type ClientCount = {
  clients: Array<
    | { __typename: "ClientV3"; id: string }
    | { __typename: "ClientV4"; id: string }
  >;
};

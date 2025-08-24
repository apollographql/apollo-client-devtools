/* eslint-disable @typescript-eslint/ban-types */
import type { QueryData } from "./scalars";
import type { QueryOptions } from "./scalars";
import type { Variables } from "./scalars";
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type { ApolloClientInfo } from "@/types.ts";
import type { SerializedApolloError as RpcSerializedApolloError } from "@/extension/tab/v3/types";
import type { SerializedError as RpcSerializedError } from "@/types";
import type { GraphQLFormattedError } from "graphql";
import type {
  SerializedCombinedGraphQLErrors as RpcSerializedCombinedGraphQLErrors,
  SerializedCombinedProtocolErrors as RpcSerializedCombinedProtocolErrors,
  SerializedLocalStateError as RpcSerializedLocalStateError,
  SerializedServerError as RpcSerializedServerError,
  SerializedServerParseError as RpcSerializedServerParseError,
  SerializedUnconventionalError as RpcSerializedUnconventionalError,
} from "@/extension/tab/v4/types";
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
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
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Represents JSON cache data */
  Cache: { input: unknown; output: unknown };
  GraphQLErrorPath: { input: unknown; output: unknown };
  JSON: { input: unknown; output: unknown };
  /** Represents data for a specific query */
  QueryData: { input: QueryData; output: QueryData };
  /** Represents options for a query */
  QueryOptions: { input: QueryOptions; output: QueryOptions };
  /** Represents variables for a query */
  Variables: { input: Variables; output: Variables };
};

export type Client = {
  cache: Scalars["Cache"]["output"];
  id: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  version: Scalars["String"]["output"];
};

export type ClientV3 = Client & {
  __typename?: "ClientV3";
  cache: Scalars["Cache"]["output"];
  id: Scalars["String"]["output"];
  mutations: ClientV3Mutations;
  name: Maybe<Scalars["String"]["output"]>;
  queries: ClientV3Queries;
  version: Scalars["String"]["output"];
};

export type ClientV3Mutation = {
  __typename?: "ClientV3Mutation";
  error: Maybe<ClientV3MutationError>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientV3MutationError = SerializedApolloError | SerializedError;

export type ClientV3Mutations = {
  __typename?: "ClientV3Mutations";
  items: Array<ClientV3Mutation>;
  total: Scalars["Int"]["output"];
};

export type ClientV3Queries = {
  __typename?: "ClientV3Queries";
  items: Array<ClientV3WatchedQuery>;
  total: Scalars["Int"]["output"];
};

export type ClientV3WatchedQueries = {
  __typename?: "ClientV3WatchedQueries";
  count: Scalars["Int"]["output"];
  queries: Array<ClientV3WatchedQuery>;
};

export type ClientV3WatchedQuery = {
  __typename?: "ClientV3WatchedQuery";
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
  __typename?: "ClientV4";
  cache: Scalars["Cache"]["output"];
  id: Scalars["String"]["output"];
  mutations: ClientV4Mutations;
  name: Maybe<Scalars["String"]["output"]>;
  queries: ClientV4Queries;
  version: Scalars["String"]["output"];
};

export type ClientV4Error =
  | SerializedCombinedGraphQlErrors
  | SerializedCombinedProtocolErrors
  | SerializedError
  | SerializedLocalStateError
  | SerializedServerError
  | SerializedServerParseError
  | SerializedUnconventionalError;

export type ClientV4Mutation = {
  __typename?: "ClientV4Mutation";
  error: Maybe<ClientV4Error>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientV4Mutations = {
  __typename?: "ClientV4Mutations";
  items: Maybe<Array<ClientV4Mutation>>;
  total: Scalars["Int"]["output"];
};

export type ClientV4Queries = {
  __typename?: "ClientV4Queries";
  items: Array<ClientV4WatchedQuery>;
  total: Scalars["Int"]["output"];
};

export type ClientV4WatchedQuery = {
  __typename?: "ClientV4WatchedQuery";
  cachedData: Maybe<Scalars["QueryData"]["output"]>;
  error: Maybe<ClientV4Error>;
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  networkStatus: Scalars["Int"]["output"];
  options: Maybe<Scalars["QueryOptions"]["output"]>;
  pollInterval: Maybe<Scalars["Int"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ErrorLike = {
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type GraphQlErrorSourceLocation = {
  __typename?: "GraphQLErrorSourceLocation";
  column: Scalars["Int"]["output"];
  line: Scalars["Int"]["output"];
};

export type Query = {
  __typename?: "Query";
  client: Maybe<Client>;
  clients: Array<Client>;
};

export type QueryClientArgs = {
  id: Scalars["ID"]["input"];
};

export type SerializedApolloError = {
  __typename?: "SerializedApolloError";
  clientErrors: Array<Scalars["String"]["output"]>;
  graphQLErrors: Array<SerializedGraphQlError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  networkError: Maybe<SerializedError>;
  protocolErrors: Array<Scalars["String"]["output"]>;
};

export type SerializedCombinedGraphQlErrors = ErrorLike & {
  __typename?: "SerializedCombinedGraphQLErrors";
  data: Maybe<Scalars["QueryData"]["output"]>;
  errors: Array<SerializedGraphQlError>;
  extensions: Maybe<Scalars["JSON"]["output"]>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedCombinedProtocolErrors = ErrorLike & {
  __typename?: "SerializedCombinedProtocolErrors";
  errors: Array<SerializedGraphQlError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedError = ErrorLike & {
  __typename?: "SerializedError";
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedGraphQlError = {
  __typename?: "SerializedGraphQLError";
  extensions: Maybe<Scalars["JSON"]["output"]>;
  locations: Maybe<Array<GraphQlErrorSourceLocation>>;
  message: Scalars["String"]["output"];
  path: Maybe<Scalars["GraphQLErrorPath"]["output"]>;
};

export type SerializedLocalStateError = ErrorLike & {
  __typename?: "SerializedLocalStateError";
  cause: Maybe<SerializedError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  path: Maybe<Scalars["GraphQLErrorPath"]["output"]>;
  stack: Maybe<Scalars["String"]["output"]>;
};

export type SerializedServerError = ErrorLike & {
  __typename?: "SerializedServerError";
  bodyText: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
  statusCode: Scalars["Int"]["output"];
};

export type SerializedServerParseError = ErrorLike & {
  __typename?: "SerializedServerParseError";
  bodyText: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
  statusCode: Scalars["Int"]["output"];
};

export type SerializedUnconventionalError = ErrorLike & {
  __typename?: "SerializedUnconventionalError";
  cause: Maybe<Scalars["JSON"]["output"]>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  ClientV3MutationError: RpcSerializedApolloError | RpcSerializedError;
  ClientV4Error:
    | RpcSerializedCombinedGraphQLErrors
    | RpcSerializedCombinedProtocolErrors
    | RpcSerializedError
    | RpcSerializedLocalStateError
    | RpcSerializedServerError
    | RpcSerializedServerParseError
    | RpcSerializedUnconventionalError;
};

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> =
  {
    Client:
      | ApolloClientInfo
      | (Omit<ClientV4, "mutations" | "queries"> & {
          mutations: _RefType["ClientV4Mutations"];
          queries: _RefType["ClientV4Queries"];
        });
    ErrorLike:
      | RpcSerializedCombinedGraphQLErrors
      | RpcSerializedCombinedProtocolErrors
      | RpcSerializedError
      | RpcSerializedLocalStateError
      | RpcSerializedServerError
      | RpcSerializedServerParseError
      | RpcSerializedUnconventionalError;
  };

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  Cache: ResolverTypeWrapper<Scalars["Cache"]["output"]>;
  Client: ResolverTypeWrapper<ApolloClientInfo>;
  ClientV3: ResolverTypeWrapper<ApolloClientInfo>;
  ClientV3Mutation: ResolverTypeWrapper<
    Omit<ClientV3Mutation, "error"> & {
      error: Maybe<ResolversTypes["ClientV3MutationError"]>;
    }
  >;
  ClientV3MutationError: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["ClientV3MutationError"]
  >;
  ClientV3Mutations: ResolverTypeWrapper<ApolloClientInfo>;
  ClientV3Queries: ResolverTypeWrapper<ApolloClientInfo>;
  ClientV3WatchedQueries: ResolverTypeWrapper<
    Omit<ClientV3WatchedQueries, "queries"> & {
      queries: Array<ResolversTypes["ClientV3WatchedQuery"]>;
    }
  >;
  ClientV3WatchedQuery: ResolverTypeWrapper<
    Omit<ClientV3WatchedQuery, "error"> & {
      error: Maybe<ResolversTypes["SerializedApolloError"]>;
    }
  >;
  ClientV4: ResolverTypeWrapper<
    Omit<ClientV4, "mutations" | "queries"> & {
      mutations: ResolversTypes["ClientV4Mutations"];
      queries: ResolversTypes["ClientV4Queries"];
    }
  >;
  ClientV4Error: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["ClientV4Error"]
  >;
  ClientV4Mutation: ResolverTypeWrapper<
    Omit<ClientV4Mutation, "error"> & {
      error: Maybe<ResolversTypes["ClientV4Error"]>;
    }
  >;
  ClientV4Mutations: ResolverTypeWrapper<ApolloClientInfo>;
  ClientV4Queries: ResolverTypeWrapper<ApolloClientInfo>;
  ClientV4WatchedQuery: ResolverTypeWrapper<
    Omit<ClientV4WatchedQuery, "error"> & {
      error: Maybe<ResolversTypes["ClientV4Error"]>;
    }
  >;
  ErrorLike: ResolverTypeWrapper<
    ResolversInterfaceTypes<ResolversTypes>["ErrorLike"]
  >;
  GraphQLErrorPath: ResolverTypeWrapper<Scalars["GraphQLErrorPath"]["output"]>;
  GraphQLErrorSourceLocation: ResolverTypeWrapper<GraphQlErrorSourceLocation>;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  Query: ResolverTypeWrapper<never>;
  QueryData: ResolverTypeWrapper<Scalars["QueryData"]["output"]>;
  QueryOptions: ResolverTypeWrapper<Scalars["QueryOptions"]["output"]>;
  SerializedApolloError: ResolverTypeWrapper<RpcSerializedApolloError>;
  SerializedCombinedGraphQLErrors: ResolverTypeWrapper<RpcSerializedCombinedGraphQLErrors>;
  SerializedCombinedProtocolErrors: ResolverTypeWrapper<RpcSerializedCombinedProtocolErrors>;
  SerializedError: ResolverTypeWrapper<RpcSerializedError>;
  SerializedGraphQLError: ResolverTypeWrapper<GraphQLFormattedError>;
  SerializedLocalStateError: ResolverTypeWrapper<RpcSerializedLocalStateError>;
  SerializedServerError: ResolverTypeWrapper<RpcSerializedServerError>;
  SerializedServerParseError: ResolverTypeWrapper<RpcSerializedServerParseError>;
  SerializedUnconventionalError: ResolverTypeWrapper<RpcSerializedUnconventionalError>;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Variables: ResolverTypeWrapper<Scalars["Variables"]["output"]>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars["Boolean"]["output"];
  Cache: Scalars["Cache"]["output"];
  Client: ApolloClientInfo;
  ClientV3: ApolloClientInfo;
  ClientV3Mutation: Omit<ClientV3Mutation, "error"> & {
    error: Maybe<ResolversParentTypes["ClientV3MutationError"]>;
  };
  ClientV3MutationError: ResolversUnionTypes<ResolversParentTypes>["ClientV3MutationError"];
  ClientV3Mutations: ApolloClientInfo;
  ClientV3Queries: ApolloClientInfo;
  ClientV3WatchedQueries: Omit<ClientV3WatchedQueries, "queries"> & {
    queries: Array<ResolversParentTypes["ClientV3WatchedQuery"]>;
  };
  ClientV3WatchedQuery: Omit<ClientV3WatchedQuery, "error"> & {
    error: Maybe<ResolversParentTypes["SerializedApolloError"]>;
  };
  ClientV4: Omit<ClientV4, "mutations" | "queries"> & {
    mutations: ResolversParentTypes["ClientV4Mutations"];
    queries: ResolversParentTypes["ClientV4Queries"];
  };
  ClientV4Error: ResolversUnionTypes<ResolversParentTypes>["ClientV4Error"];
  ClientV4Mutation: Omit<ClientV4Mutation, "error"> & {
    error: Maybe<ResolversParentTypes["ClientV4Error"]>;
  };
  ClientV4Mutations: ApolloClientInfo;
  ClientV4Queries: ApolloClientInfo;
  ClientV4WatchedQuery: Omit<ClientV4WatchedQuery, "error"> & {
    error: Maybe<ResolversParentTypes["ClientV4Error"]>;
  };
  ErrorLike: ResolversInterfaceTypes<ResolversParentTypes>["ErrorLike"];
  GraphQLErrorPath: Scalars["GraphQLErrorPath"]["output"];
  GraphQLErrorSourceLocation: GraphQlErrorSourceLocation;
  ID: Scalars["ID"]["output"];
  Int: Scalars["Int"]["output"];
  JSON: Scalars["JSON"]["output"];
  Query: never;
  QueryData: Scalars["QueryData"]["output"];
  QueryOptions: Scalars["QueryOptions"]["output"];
  SerializedApolloError: RpcSerializedApolloError;
  SerializedCombinedGraphQLErrors: RpcSerializedCombinedGraphQLErrors;
  SerializedCombinedProtocolErrors: RpcSerializedCombinedProtocolErrors;
  SerializedError: RpcSerializedError;
  SerializedGraphQLError: GraphQLFormattedError;
  SerializedLocalStateError: RpcSerializedLocalStateError;
  SerializedServerError: RpcSerializedServerError;
  SerializedServerParseError: RpcSerializedServerParseError;
  SerializedUnconventionalError: RpcSerializedUnconventionalError;
  String: Scalars["String"]["output"];
  Variables: Scalars["Variables"]["output"];
};

export interface CacheScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Cache"], any> {
  name: "Cache";
}

export type ClientResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["Client"] = ResolversParentTypes["Client"],
> = {
  __resolveType: TypeResolveFn<
    "ClientV3" | "ClientV4",
    ParentType,
    ContextType
  >;
  cache?: Resolver<ResolversTypes["Cache"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  version?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
};

export type ClientV3Resolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV3"] = ResolversParentTypes["ClientV3"],
> = {
  cache?: Resolver<ResolversTypes["Cache"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  mutations?: Resolver<
    ResolversTypes["ClientV3Mutations"],
    ParentType,
    ContextType
  >;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  queries?: Resolver<
    ResolversTypes["ClientV3Queries"],
    ParentType,
    ContextType
  >;
  version?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV3MutationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV3Mutation"] = ResolversParentTypes["ClientV3Mutation"],
> = {
  error?: Resolver<
    Maybe<ResolversTypes["ClientV3MutationError"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  loading?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  mutationString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  variables?: Resolver<
    Maybe<ResolversTypes["Variables"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV3MutationErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV3MutationError"] = ResolversParentTypes["ClientV3MutationError"],
> = {
  __resolveType: TypeResolveFn<
    "SerializedApolloError" | "SerializedError",
    ParentType,
    ContextType
  >;
};

export type ClientV3MutationsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV3Mutations"] = ResolversParentTypes["ClientV3Mutations"],
> = {
  items?: Resolver<
    Array<ResolversTypes["ClientV3Mutation"]>,
    ParentType,
    ContextType
  >;
  total?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV3QueriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV3Queries"] = ResolversParentTypes["ClientV3Queries"],
> = {
  items?: Resolver<
    Array<ResolversTypes["ClientV3WatchedQuery"]>,
    ParentType,
    ContextType
  >;
  total?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV3WatchedQueriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV3WatchedQueries"] = ResolversParentTypes["ClientV3WatchedQueries"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  queries?: Resolver<
    Array<ResolversTypes["ClientV3WatchedQuery"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV3WatchedQueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV3WatchedQuery"] = ResolversParentTypes["ClientV3WatchedQuery"],
> = {
  cachedData?: Resolver<
    Maybe<ResolversTypes["QueryData"]>,
    ParentType,
    ContextType
  >;
  error?: Resolver<
    Maybe<ResolversTypes["SerializedApolloError"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  networkStatus?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  options?: Resolver<
    Maybe<ResolversTypes["QueryOptions"]>,
    ParentType,
    ContextType
  >;
  pollInterval?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  queryString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  variables?: Resolver<
    Maybe<ResolversTypes["Variables"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV4Resolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV4"] = ResolversParentTypes["ClientV4"],
> = {
  cache?: Resolver<ResolversTypes["Cache"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  mutations?: Resolver<
    ResolversTypes["ClientV4Mutations"],
    ParentType,
    ContextType
  >;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  queries?: Resolver<
    ResolversTypes["ClientV4Queries"],
    ParentType,
    ContextType
  >;
  version?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV4ErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV4Error"] = ResolversParentTypes["ClientV4Error"],
> = {
  __resolveType: TypeResolveFn<
    | "SerializedCombinedGraphQLErrors"
    | "SerializedCombinedProtocolErrors"
    | "SerializedError"
    | "SerializedLocalStateError"
    | "SerializedServerError"
    | "SerializedServerParseError"
    | "SerializedUnconventionalError",
    ParentType,
    ContextType
  >;
};

export type ClientV4MutationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV4Mutation"] = ResolversParentTypes["ClientV4Mutation"],
> = {
  error?: Resolver<
    Maybe<ResolversTypes["ClientV4Error"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  loading?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  mutationString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  variables?: Resolver<
    Maybe<ResolversTypes["Variables"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV4MutationsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV4Mutations"] = ResolversParentTypes["ClientV4Mutations"],
> = {
  items?: Resolver<
    Maybe<Array<ResolversTypes["ClientV4Mutation"]>>,
    ParentType,
    ContextType
  >;
  total?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV4QueriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV4Queries"] = ResolversParentTypes["ClientV4Queries"],
> = {
  items?: Resolver<
    Array<ResolversTypes["ClientV4WatchedQuery"]>,
    ParentType,
    ContextType
  >;
  total?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientV4WatchedQueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientV4WatchedQuery"] = ResolversParentTypes["ClientV4WatchedQuery"],
> = {
  cachedData?: Resolver<
    Maybe<ResolversTypes["QueryData"]>,
    ParentType,
    ContextType
  >;
  error?: Resolver<
    Maybe<ResolversTypes["ClientV4Error"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  networkStatus?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  options?: Resolver<
    Maybe<ResolversTypes["QueryOptions"]>,
    ParentType,
    ContextType
  >;
  pollInterval?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  queryString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  variables?: Resolver<
    Maybe<ResolversTypes["Variables"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorLikeResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ErrorLike"] = ResolversParentTypes["ErrorLike"],
> = {
  __resolveType: TypeResolveFn<
    | "SerializedCombinedGraphQLErrors"
    | "SerializedCombinedProtocolErrors"
    | "SerializedError"
    | "SerializedLocalStateError"
    | "SerializedServerError"
    | "SerializedServerParseError"
    | "SerializedUnconventionalError",
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
};

export interface GraphQlErrorPathScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["GraphQLErrorPath"], any> {
  name: "GraphQLErrorPath";
}

export type GraphQlErrorSourceLocationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["GraphQLErrorSourceLocation"] = ResolversParentTypes["GraphQLErrorSourceLocation"],
> = {
  column?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  line?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["JSON"], any> {
  name: "JSON";
}

export type QueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  client?: Resolver<
    Maybe<ResolversTypes["Client"]>,
    ParentType,
    ContextType,
    RequireFields<QueryClientArgs, "id">
  >;
  clients?: Resolver<Array<ResolversTypes["Client"]>, ParentType, ContextType>;
};

export interface QueryDataScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["QueryData"], any> {
  name: "QueryData";
}

export interface QueryOptionsScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["QueryOptions"], any> {
  name: "QueryOptions";
}

export type SerializedApolloErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedApolloError"] = ResolversParentTypes["SerializedApolloError"],
> = {
  clientErrors?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  graphQLErrors?: Resolver<
    Array<ResolversTypes["SerializedGraphQLError"]>,
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  networkError?: Resolver<
    Maybe<ResolversTypes["SerializedError"]>,
    ParentType,
    ContextType
  >;
  protocolErrors?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedCombinedGraphQlErrorsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedCombinedGraphQLErrors"] = ResolversParentTypes["SerializedCombinedGraphQLErrors"],
> = {
  data?: Resolver<Maybe<ResolversTypes["QueryData"]>, ParentType, ContextType>;
  errors?: Resolver<
    Array<ResolversTypes["SerializedGraphQLError"]>,
    ParentType,
    ContextType
  >;
  extensions?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedCombinedProtocolErrorsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedCombinedProtocolErrors"] = ResolversParentTypes["SerializedCombinedProtocolErrors"],
> = {
  errors?: Resolver<
    Array<ResolversTypes["SerializedGraphQLError"]>,
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedError"] = ResolversParentTypes["SerializedError"],
> = {
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedGraphQlErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedGraphQLError"] = ResolversParentTypes["SerializedGraphQLError"],
> = {
  extensions?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  locations?: Resolver<
    Maybe<Array<ResolversTypes["GraphQLErrorSourceLocation"]>>,
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  path?: Resolver<
    Maybe<ResolversTypes["GraphQLErrorPath"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedLocalStateErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedLocalStateError"] = ResolversParentTypes["SerializedLocalStateError"],
> = {
  cause?: Resolver<
    Maybe<ResolversTypes["SerializedError"]>,
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  path?: Resolver<
    Maybe<ResolversTypes["GraphQLErrorPath"]>,
    ParentType,
    ContextType
  >;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedServerErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedServerError"] = ResolversParentTypes["SerializedServerError"],
> = {
  bodyText?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedServerParseErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedServerParseError"] = ResolversParentTypes["SerializedServerParseError"],
> = {
  bodyText?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedUnconventionalErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedUnconventionalError"] = ResolversParentTypes["SerializedUnconventionalError"],
> = {
  cause?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VariablesScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Variables"], any> {
  name: "Variables";
}

export type Resolvers<ContextType = any> = {
  Cache?: GraphQLScalarType;
  Client?: ClientResolvers<ContextType>;
  ClientV3?: ClientV3Resolvers<ContextType>;
  ClientV3Mutation?: ClientV3MutationResolvers<ContextType>;
  ClientV3MutationError?: ClientV3MutationErrorResolvers<ContextType>;
  ClientV3Mutations?: ClientV3MutationsResolvers<ContextType>;
  ClientV3Queries?: ClientV3QueriesResolvers<ContextType>;
  ClientV3WatchedQueries?: ClientV3WatchedQueriesResolvers<ContextType>;
  ClientV3WatchedQuery?: ClientV3WatchedQueryResolvers<ContextType>;
  ClientV4?: ClientV4Resolvers<ContextType>;
  ClientV4Error?: ClientV4ErrorResolvers<ContextType>;
  ClientV4Mutation?: ClientV4MutationResolvers<ContextType>;
  ClientV4Mutations?: ClientV4MutationsResolvers<ContextType>;
  ClientV4Queries?: ClientV4QueriesResolvers<ContextType>;
  ClientV4WatchedQuery?: ClientV4WatchedQueryResolvers<ContextType>;
  ErrorLike?: ErrorLikeResolvers<ContextType>;
  GraphQLErrorPath?: GraphQLScalarType;
  GraphQLErrorSourceLocation?: GraphQlErrorSourceLocationResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  QueryData?: GraphQLScalarType;
  QueryOptions?: GraphQLScalarType;
  SerializedApolloError?: SerializedApolloErrorResolvers<ContextType>;
  SerializedCombinedGraphQLErrors?: SerializedCombinedGraphQlErrorsResolvers<ContextType>;
  SerializedCombinedProtocolErrors?: SerializedCombinedProtocolErrorsResolvers<ContextType>;
  SerializedError?: SerializedErrorResolvers<ContextType>;
  SerializedGraphQLError?: SerializedGraphQlErrorResolvers<ContextType>;
  SerializedLocalStateError?: SerializedLocalStateErrorResolvers<ContextType>;
  SerializedServerError?: SerializedServerErrorResolvers<ContextType>;
  SerializedServerParseError?: SerializedServerParseErrorResolvers<ContextType>;
  SerializedUnconventionalError?: SerializedUnconventionalErrorResolvers<ContextType>;
  Variables?: GraphQLScalarType;
};

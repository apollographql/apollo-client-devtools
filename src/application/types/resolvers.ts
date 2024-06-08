/* eslint-disable @typescript-eslint/ban-types */
import type { QueryData } from "./scalars";
import type { QueryOptions } from "./scalars";
import type { Variables } from "./scalars";
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
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
  /** Represents data for a specific query */
  QueryData: { input: QueryData; output: QueryData };
  /** Represents options for a query */
  QueryOptions: { input: QueryOptions; output: QueryOptions };
  /** Represents variables for a query */
  Variables: { input: Variables; output: Variables };
};

export type MutationLog = {
  __typename?: "MutationLog";
  count: Scalars["Int"]["output"];
  mutations: Array<WatchedMutation>;
};

export type Query = {
  __typename?: "Query";
  cache: Scalars["String"]["output"];
  clientVersion?: Maybe<Scalars["String"]["output"]>;
  mutation?: Maybe<WatchedMutation>;
  mutationLog: MutationLog;
  watchedQueries: WatchedQueries;
  watchedQuery?: Maybe<WatchedQuery>;
};

export type QueryMutationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWatchedQueryArgs = {
  id: Scalars["ID"]["input"];
};

export type WatchedMutation = {
  __typename?: "WatchedMutation";
  id: Scalars["ID"]["output"];
  mutationString: Scalars["String"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  variables?: Maybe<Scalars["Variables"]["output"]>;
};

export type WatchedQueries = {
  __typename?: "WatchedQueries";
  count: Scalars["Int"]["output"];
  queries: Array<WatchedQuery>;
};

export type WatchedQuery = {
  __typename?: "WatchedQuery";
  cachedData?: Maybe<Scalars["QueryData"]["output"]>;
  id: Scalars["ID"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  options?: Maybe<Scalars["QueryOptions"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables?: Maybe<Scalars["Variables"]["output"]>;
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

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  MutationLog: ResolverTypeWrapper<MutationLog>;
  Query: ResolverTypeWrapper<never>;
  QueryData: ResolverTypeWrapper<Scalars["QueryData"]["output"]>;
  QueryOptions: ResolverTypeWrapper<Scalars["QueryOptions"]["output"]>;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Variables: ResolverTypeWrapper<Scalars["Variables"]["output"]>;
  WatchedMutation: ResolverTypeWrapper<WatchedMutation>;
  WatchedQueries: ResolverTypeWrapper<WatchedQueries>;
  WatchedQuery: ResolverTypeWrapper<WatchedQuery>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars["Boolean"]["output"];
  ID: Scalars["ID"]["output"];
  Int: Scalars["Int"]["output"];
  MutationLog: MutationLog;
  Query: never;
  QueryData: Scalars["QueryData"]["output"];
  QueryOptions: Scalars["QueryOptions"]["output"];
  String: Scalars["String"]["output"];
  Variables: Scalars["Variables"]["output"];
  WatchedMutation: WatchedMutation;
  WatchedQueries: WatchedQueries;
  WatchedQuery: WatchedQuery;
};

export type MutationLogResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["MutationLog"] = ResolversParentTypes["MutationLog"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  mutations?: Resolver<
    Array<ResolversTypes["WatchedMutation"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  cache?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  clientVersion?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  mutation?: Resolver<
    Maybe<ResolversTypes["WatchedMutation"]>,
    ParentType,
    ContextType,
    RequireFields<QueryMutationArgs, "id">
  >;
  mutationLog?: Resolver<
    ResolversTypes["MutationLog"],
    ParentType,
    ContextType
  >;
  watchedQueries?: Resolver<
    ResolversTypes["WatchedQueries"],
    ParentType,
    ContextType
  >;
  watchedQuery?: Resolver<
    Maybe<ResolversTypes["WatchedQuery"]>,
    ParentType,
    ContextType,
    RequireFields<QueryWatchedQueryArgs, "id">
  >;
};

export interface QueryDataScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["QueryData"], any> {
  name: "QueryData";
}

export interface QueryOptionsScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["QueryOptions"], any> {
  name: "QueryOptions";
}

export interface VariablesScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Variables"], any> {
  name: "Variables";
}

export type WatchedMutationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["WatchedMutation"] = ResolversParentTypes["WatchedMutation"],
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  mutationString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  variables?: Resolver<
    Maybe<ResolversTypes["Variables"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WatchedQueriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["WatchedQueries"] = ResolversParentTypes["WatchedQueries"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  queries?: Resolver<
    Array<ResolversTypes["WatchedQuery"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WatchedQueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["WatchedQuery"] = ResolversParentTypes["WatchedQuery"],
> = {
  cachedData?: Resolver<
    Maybe<ResolversTypes["QueryData"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  options?: Resolver<
    Maybe<ResolversTypes["QueryOptions"]>,
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

export type Resolvers<ContextType = any> = {
  MutationLog?: MutationLogResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QueryData?: GraphQLScalarType;
  QueryOptions?: GraphQLScalarType;
  Variables?: GraphQLScalarType;
  WatchedMutation?: WatchedMutationResolvers<ContextType>;
  WatchedQueries?: WatchedQueriesResolvers<ContextType>;
  WatchedQuery?: WatchedQueryResolvers<ContextType>;
};

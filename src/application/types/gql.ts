import { Cache } from "./scalars";
import { QueryData } from "./scalars";
import { Variables } from "./scalars";
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
  ID: { input: number; output: number };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Represents data in the cache as a whole */
  Cache: { input: Cache; output: Cache };
  /** Represents data for a specific query */
  QueryData: { input: QueryData; output: QueryData };
  /** Represents variables for a query */
  Variables: { input: Variables; output: Variables };
};

export type Mutation = {
  __typename: "Mutation";
  id: Scalars["ID"]["output"];
  mutationString: Maybe<Scalars["String"]["output"]>;
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type MutationLog = {
  __typename: "MutationLog";
  count: Scalars["Int"]["output"];
  mutations: Array<Mutation>;
};

export type Query = {
  __typename: "Query";
  cache: Maybe<Scalars["Cache"]["output"]>;
  mutation: Maybe<Mutation>;
  mutationLog: MutationLog;
  watchedQueries: WatchedQueries;
  watchedQuery: Maybe<WatchedQuery>;
};

export type QueryMutationArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryWatchedQueryArgs = {
  id: Scalars["ID"]["input"];
};

export type WatchedQueries = {
  __typename: "WatchedQueries";
  count: Scalars["Int"]["output"];
  queries: Array<WatchedQuery>;
};

export type WatchedQuery = {
  __typename: "WatchedQuery";
  cachedData: Maybe<Scalars["QueryData"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type GetOperationCountsVariables = Exact<{ [key: string]: never }>;

export type GetOperationCounts = {
  watchedQueries: { __typename: "WatchedQueries"; count: number };
  mutationLog: { __typename: "MutationLog"; count: number };
};

export type GetCacheVariables = Exact<{ [key: string]: never }>;

export type GetCache = { cache: Cache | null };

export type GetMutationsVariables = Exact<{ [key: string]: never }>;

export type GetMutations = {
  mutationLog: {
    __typename: "MutationLog";
    mutations: Array<{ id: number; name: string | null }>;
  };
};

export type GetSelectedMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetSelectedMutation = {
  mutation: {
    id: number;
    name: string | null;
    mutationString: string | null;
    variables: Variables | null;
  } | null;
};

export type GetWatchedQueriesVariables = Exact<{ [key: string]: never }>;

export type GetWatchedQueries = {
  watchedQueries: {
    __typename: "WatchedQueries";
    queries: Array<{
      __typename: "WatchedQuery";
      id: number;
      name: string | null;
      queryString: string;
      variables: Variables | null;
      cachedData: QueryData | null;
    }>;
  };
};

export type GetQueriesVariables = Exact<{ [key: string]: never }>;

export type GetQueries = {
  watchedQueries: {
    __typename: "WatchedQueries";
    count: number;
    queries: Array<{
      __typename: "WatchedQuery";
      name: string | null;
      queryString: string;
      variables: Variables | null;
      cachedData: QueryData | null;
    }>;
  };
};

export type GetAllMutationsVariables = Exact<{ [key: string]: never }>;

export type GetAllMutations = {
  mutationLog: {
    __typename: "MutationLog";
    count: number;
    mutations: Array<{
      name: string | null;
      mutationString: string | null;
      variables: Variables | null;
    }>;
  };
};

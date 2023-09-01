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
  /** Represents data for a specific query */
  QueryData: { input: QueryData; output: QueryData };
  /** Represents variables for a query */
  Variables: { input: Variables; output: Variables };
};

export type MutationLog = {
  __typename: "MutationLog";
  count: Scalars["Int"]["output"];
  mutations: Array<WatchedMutation>;
};

export type Query = {
  __typename: "Query";
  cache: Scalars["String"]["output"];
  mutation: Maybe<WatchedMutation>;
  mutationLog: MutationLog;
  watchedQueries: WatchedQueries;
  watchedQuery: Maybe<WatchedQuery>;
};

export type QuerymutationArgs = {
  id: Scalars["ID"]["input"];
};

export type QuerywatchedQueryArgs = {
  id: Scalars["ID"]["input"];
};

export type WatchedMutation = {
  __typename: "WatchedMutation";
  id: Scalars["ID"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
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

export type GetCache = { cache: string };

export type MutationViewer_mutation = {
  __typename: "WatchedMutation";
  mutationString: string;
  variables: Variables | null;
};

export type GetMutationsVariables = Exact<{ [key: string]: never }>;

export type GetMutations = {
  mutationLog: {
    __typename: "MutationLog";
    mutations: Array<{
      __typename: "WatchedMutation";
      id: number;
      name: string | null;
      mutationString: string;
      variables: Variables | null;
    }>;
  };
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

export type QueryViewer_query = {
  __typename: "WatchedQuery";
  queryString: string;
  variables: Variables | null;
  cachedData: QueryData | null;
};

export type GetQueriesVariables = Exact<{ [key: string]: never }>;

export type GetQueries = {
  watchedQueries: {
    __typename: "WatchedQueries";
    count: number;
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

export type GetAllMutationsVariables = Exact<{ [key: string]: never }>;

export type GetAllMutations = {
  mutationLog: {
    __typename: "MutationLog";
    count: number;
    mutations: Array<{
      __typename: "WatchedMutation";
      id: number;
      name: string | null;
      mutationString: string;
      variables: Variables | null;
    }>;
  };
};

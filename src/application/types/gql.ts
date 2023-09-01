import { JSONObject } from "./json";
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
  Cache: { input: JSONObject; output: JSONObject };
  Variables: { input: JSONObject; output: JSONObject };
};

export type Mutation = {
  __typename: "Mutation";
  id: Scalars["ID"]["output"];
  mutationString: Scalars["String"]["output"];
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
  cachedData: Maybe<Scalars["Cache"]["output"]>;
  id: Scalars["ID"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type GetOperationCountsVariables = Exact<{ [key: string]: never }>;

export type GetOperationCounts = {
  __typename: "Query";
  watchedQueries: { __typename: "WatchedQueries"; count: number };
  mutationLog: { __typename: "MutationLog"; count: number };
};

export type GetCacheVariables = Exact<{ [key: string]: never }>;

export type GetCache = { __typename: "Query"; cache: JSONObject | null };

export type GetMutationsVariables = Exact<{ [key: string]: never }>;

export type GetMutations = {
  __typename: "Query";
  mutationLog: {
    __typename: "MutationLog";
    mutations: Array<{
      __typename: "Mutation";
      id: number;
      name: string | null;
    }>;
  };
};

export type GetSelectedMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetSelectedMutation = {
  __typename: "Query";
  mutation: {
    __typename: "Mutation";
    id: number;
    name: string | null;
    mutationString: string;
    variables: JSONObject | null;
  } | null;
};

export type GetWatchedQueriesVariables = Exact<{ [key: string]: never }>;

export type GetWatchedQueries = {
  __typename: "Query";
  watchedQueries: {
    __typename: "WatchedQueries";
    queries: Array<{
      __typename: "WatchedQuery";
      id: number;
      name: string | null;
    }>;
  };
};

export type GetWatchedQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetWatchedQuery = {
  __typename: "Query";
  watchedQuery: {
    __typename: "WatchedQuery";
    id: number;
    name: string | null;
    queryString: string;
    variables: JSONObject | null;
    cachedData: JSONObject | null;
  } | null;
};

export type GetQueriesVariables = Exact<{ [key: string]: never }>;

export type GetQueries = {
  __typename: "Query";
  watchedQueries: {
    __typename: "WatchedQueries";
    count: number;
    queries: Array<{
      __typename: "WatchedQuery";
      name: string | null;
      queryString: string;
      variables: JSONObject | null;
      cachedData: JSONObject | null;
    }>;
  };
};

export type GetAllMutationsVariables = Exact<{ [key: string]: never }>;

export type GetAllMutations = {
  __typename: "Query";
  mutationLog: {
    __typename: "MutationLog";
    count: number;
    mutations: Array<{
      __typename: "Mutation";
      name: string | null;
      mutationString: string;
      variables: JSONObject | null;
    }>;
  };
};

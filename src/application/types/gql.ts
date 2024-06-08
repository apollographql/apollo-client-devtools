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
  ID: { input: number; output: number };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  GraphQLErrorPath: { input: GraphQLErrorPath; output: GraphQLErrorPath };
  JSON: { input: JSON; output: JSON };
  /** Represents data for a specific query */
  QueryData: { input: QueryData; output: QueryData };
  /** Represents options for a query */
  QueryOptions: { input: QueryOptions; output: QueryOptions };
  /** Represents variables for a query */
  Variables: { input: Variables; output: Variables };
};

export type Client = {
  __typename: "Client";
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  selected: Scalars["Boolean"]["output"];
  version: Scalars["String"]["output"];
};

export type GraphQLErrorSourceLocation = {
  __typename: "GraphQLErrorSourceLocation";
  column: Scalars["Int"]["output"];
  line: Scalars["Int"]["output"];
};

export type MutationLog = {
  __typename: "MutationLog";
  count: Scalars["Int"]["output"];
  mutations: Array<WatchedMutation>;
};

export type Query = {
  __typename: "Query";
  cache: Scalars["String"]["output"];
  clientVersion: Maybe<Scalars["String"]["output"]>;
  clients: Array<Client>;
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

export type SerializedApolloError = {
  __typename: "SerializedApolloError";
  clientErrors: Array<Scalars["String"]["output"]>;
  graphQLErrors: Array<SerializedGraphQLError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  networkError: Maybe<SerializedError>;
  protocolErrors: Array<Scalars["String"]["output"]>;
};

export type SerializedError = {
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

export type WatchedMutation = {
  __typename: "WatchedMutation";
  error: Maybe<WatchedMutationError>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type WatchedMutationError = SerializedApolloError | SerializedError;

export type WatchedQueries = {
  __typename: "WatchedQueries";
  count: Scalars["Int"]["output"];
  queries: Array<WatchedQuery>;
};

export type WatchedQuery = {
  __typename: "WatchedQuery";
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

export type GetOperationCountsVariables = Exact<{ [key: string]: never }>;

export type GetOperationCounts = {
  clientVersion: string | null;
  watchedQueries: { __typename: "WatchedQueries"; count: number };
  mutationLog: { __typename: "MutationLog"; count: number };
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

export type GetCacheVariables = Exact<{ [key: string]: never }>;

export type GetCache = { cache: string };

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
};

export type SerializedErrorAlertDisclosureItem_error = {
  __typename: "SerializedError";
  message: string;
  name: string;
  stack: string | null;
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
      options: QueryOptions | null;
      networkStatus: number;
      pollInterval: number | null;
      error: {
        __typename: "SerializedApolloError";
        message: string;
        clientErrors: Array<string>;
        name: string;
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
      loading: boolean;
      error:
        | {
            __typename: "SerializedApolloError";
            message: string;
            clientErrors: Array<string>;
            name: string;
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
};

export type ClientVersionVariables = Exact<{ [key: string]: never }>;

export type ClientVersion = { clientVersion: string | null };

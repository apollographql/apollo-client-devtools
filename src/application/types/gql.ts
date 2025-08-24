import type { Cache } from "./scalars";
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
  cache: Scalars["Cache"]["output"];
  id: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  version: Scalars["String"]["output"];
};

export type ClientV3 = Client & {
  __typename: "ClientV3";
  cache: Scalars["Cache"]["output"];
  id: Scalars["String"]["output"];
  mutations: ClientV3Mutations;
  name: Maybe<Scalars["String"]["output"]>;
  queries: ClientV3Queries;
  version: Scalars["String"]["output"];
};

export type ClientV3Mutations = {
  __typename: "ClientV3Mutations";
  items: Array<ClientV3WatchedMutation>;
  total: Scalars["Int"]["output"];
};

export type ClientV3Queries = {
  __typename: "ClientV3Queries";
  items: Array<WatchedQuery>;
  total: Scalars["Int"]["output"];
};

export type ClientV3WatchedMutation = {
  __typename: "ClientV3WatchedMutation";
  error: Maybe<ClientV3WatchedMutationError>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ClientV3WatchedMutationError =
  | SerializedApolloError
  | SerializedError;

export type ClientV4 = Client & {
  __typename: "ClientV4";
  cache: Scalars["Cache"]["output"];
  id: Scalars["String"]["output"];
  mutations: ClientV4Mutations;
  name: Maybe<Scalars["String"]["output"]>;
  version: Scalars["String"]["output"];
};

export type ClientV4Error =
  | SerializedCombinedGraphQLErrors
  | SerializedCombinedProtocolErrors
  | SerializedError
  | SerializedLocalStateError
  | SerializedServerError
  | SerializedServerParseError
  | SerializedUnconventionalError;

export type ClientV4Mutations = {
  __typename: "ClientV4Mutations";
  items: Maybe<Array<ClientV4WatchedMutation>>;
  total: Scalars["Int"]["output"];
};

export type ClientV4WatchedMutation = {
  __typename: "ClientV4WatchedMutation";
  error: Maybe<ClientV4Error>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name: Maybe<Scalars["String"]["output"]>;
  variables: Maybe<Scalars["Variables"]["output"]>;
};

export type ErrorLike = {
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack: Maybe<Scalars["String"]["output"]>;
};

export type GraphQLErrorSourceLocation = {
  __typename: "GraphQLErrorSourceLocation";
  column: Scalars["Int"]["output"];
  line: Scalars["Int"]["output"];
};

export type Query = {
  __typename: "Query";
  client: Maybe<Client>;
  clients: Array<Client>;
};

export type QueryclientArgs = {
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
    | { __typename: "ClientV4"; id: string; version: string }
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
    | { __typename: "ClientV3"; id: string; cache: Cache }
    | { __typename: "ClientV4"; id: string; cache: Cache }
    | null;
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
            __typename: "ClientV3WatchedMutation";
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
    | { __typename: "ClientV4"; id: string }
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
            __typename: "WatchedQuery";
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
    | { __typename: "ClientV4"; id: string }
    | null;
};

export type SerializedErrorAlertDisclosureItem_error = {
  __typename: "SerializedError";
  message: string;
  name: string;
  stack: string | null;
};

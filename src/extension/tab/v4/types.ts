import type { JSONValue } from "@/application/types/json";
import type { QueryData } from "@/application/types/scalars";
import type { SerializedError } from "@/types";
import type {
  ApolloClient,
  NetworkStatus,
  OperationVariables,
} from "@apollo/client";
import type { DocumentNode, GraphQLFormattedError } from "graphql";

type ErrorType =
  | SerializedError
  | SerializedCombinedGraphQLErrors
  | SerializedCombinedProtocolErrors
  | SerializedLocalStateError
  | SerializedServerError
  | SerializedServerParseError
  | SerializedUnconventionalError;

export interface MutationV4Details {
  document: DocumentNode;
  variables: OperationVariables | undefined;
  loading: boolean;
  error: ErrorType | null;
}

export interface QueryV4Details {
  id: string;
  document: DocumentNode;
  variables?: OperationVariables;
  cachedData?: QueryData;
  options?: QueryV4Options;
  networkStatus: NetworkStatus;
  error: ErrorType | null;
  pollInterval?: number;
}

export type QueryV4Options = Pick<
  ApolloClient.WatchQueryOptions,
  | "context"
  | "fetchPolicy"
  | "errorPolicy"
  | "pollInterval"
  | "returnPartialData"
  | "refetchWritePolicy"
  | "notifyOnNetworkStatusChange"
> & { nextFetchPolicy?: string };

export interface SerializedCombinedGraphQLErrors extends SerializedError {
  errors: ReadonlyArray<GraphQLFormattedError>;
  data: Record<string, any> | null | undefined;
  extensions: Record<string, any> | undefined;
}

export interface SerializedCombinedProtocolErrors extends SerializedError {
  errors: ReadonlyArray<GraphQLFormattedError>;
}

export interface SerializedLocalStateError extends SerializedError {
  path: Array<string | number> | undefined;
  cause: SerializedError | undefined;
}

export interface SerializedServerError extends SerializedError {
  bodyText: string;
  statusCode: number;
}

export interface SerializedServerParseError extends SerializedError {
  bodyText: string;
  statusCode: number;
  cause: SerializedError | undefined;
}

export interface SerializedUnconventionalError extends SerializedError {
  cause: JSONValue | undefined;
}

export type MemoryInternalsV4 = ReturnType<
  NonNullable<ApolloClient["getMemoryInternals"]>
>;

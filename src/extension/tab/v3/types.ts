import type {
  ApolloClient,
  ApolloError,
  NetworkStatus,
  OperationVariables,
  WatchQueryOptions,
} from "@apollo/client-3";
import type { SerializedError } from "../../../types";
import type { DocumentNode, GraphQLFormattedError } from "graphql";
import type { QueryData } from "@/application/types/scalars";

export interface MutationStoreValue {
  mutation: DocumentNode;
  variables: OperationVariables;
  loading: boolean;
  error: Error | null;
}

export interface MutationV3Details {
  document: DocumentNode;
  variables?: OperationVariables;
  loading: boolean;
  error: SerializedApolloError | SerializedError | null;
}

export interface SerializedApolloError extends Pick<ApolloError, "message"> {
  name: "ApolloError";
  clientErrors: string[];
  networkError?: SerializedError;
  graphQLErrors: ReadonlyArray<GraphQLFormattedError>;
  protocolErrors: string[];
}

export interface QueryV3Details {
  id: string;
  document: DocumentNode;
  variables?: OperationVariables;
  cachedData?: QueryData; // Not a member of the actual Apollo Client QueryInfo type
  options?: QueryV3Options;
  networkStatus: NetworkStatus;
  error?: SerializedApolloError;
  pollInterval?: number;
}

export type QueryV3Options = Pick<
  WatchQueryOptions,
  | "context"
  | "fetchPolicy"
  | "errorPolicy"
  | "pollInterval"
  | "partialRefetch"
  | "canonizeResults"
  | "returnPartialData"
  | "refetchWritePolicy"
  | "notifyOnNetworkStatusChange"
> & { nextFetchPolicy?: string };

export type MemoryInternalsV3 = ReturnType<
  NonNullable<ApolloClient<any>["getMemoryInternals"]>
>;

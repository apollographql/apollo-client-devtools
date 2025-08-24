import type { JSONValue } from "@/application/types/json";
import type { SerializedError } from "@/types";
import type { OperationVariables } from "@apollo/client";
import type { DocumentNode, GraphQLFormattedError } from "graphql";

export interface MutationV4Details {
  document: DocumentNode;
  variables: OperationVariables | undefined;
  loading: boolean;
  error:
    | SerializedError
    | SerializedCombinedGraphQLErrors
    | SerializedLocalStateError
    | SerializedServerError
    | SerializedServerParseError
    | SerializedUnconventionalError
    | null;
}

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

import type { JSONValue } from "@/application/types/json";
import type { SerializedError } from "@/types";
import type { OperationVariables } from "@apollo/client";
import type { DocumentNode, GraphQLFormattedError } from "graphql";

export interface MutationV4Details {
  document: DocumentNode;
  variables?: OperationVariables;
  loading: boolean;
  error:
    | SerializedError
    | SerializedCombinedGraphQLErrors
    | SerializedLocalStateError
    | SerializedServerError
    | SerializedServerParseError
    | SerializedUnconventionalError;
}

interface SerializedErrorLike {
  message: string;
  name: string;
  stack?: string;
}

export interface SerializedCombinedGraphQLErrors extends SerializedErrorLike {
  errors: GraphQLFormattedError[];
  data: Record<string, any> | null | undefined;
  extensions: Record<string, any> | undefined;
}

export interface SerializedCombinedProtocolErrors extends SerializedErrorLike {
  errors: GraphQLFormattedError[];
}

export interface SerializedLocalStateError extends SerializedErrorLike {
  path: Array<string | number> | undefined;
  cause: SerializedErrorLike | undefined;
}

export interface SerializedServerError extends SerializedErrorLike {
  bodyText: string;
  statusCode: number;
}

export interface SerializedServerParseError extends SerializedErrorLike {
  bodyText: string;
  statusCode: number;
  cause: SerializedErrorLike | undefined;
}

export interface SerializedUnconventionalError extends SerializedErrorLike {
  cause: JSONValue | undefined;
}

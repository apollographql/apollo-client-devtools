import type { ApolloError, OperationVariables } from "@apollo/client-3";
import type { SerializedError } from "../../../types";
import type { DocumentNode, GraphQLFormattedError } from "graphql";

export interface MutationStoreValue {
  mutation: DocumentNode;
  variables: OperationVariables;
  loading: boolean;
  error: Error | null;
}

export interface MutationDetails {
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

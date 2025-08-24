import type { ApolloError } from "@apollo/client-3";
import { isApolloError, type ApolloClient } from "@apollo/client-3";
import { ClientHandler } from "../clientHandler";
import type {
  MutationV3Details,
  MutationStoreValue,
  SerializedApolloError,
} from "./types";
import { serializeError } from "../helpers";

export class ClientV3Handler extends ClientHandler<ApolloClient<any>> {
  getMutations(): MutationV3Details[] {
    const mutationsObj: Record<string, MutationStoreValue> =
      (this.client?.queryManager.mutationStore?.getStore
        ? // @ts-expect-error Apollo Client 3.0 - 3.2
          this.client.queryManager.mutationStore?.getStore()
        : // Apollo Client 3.3
          this.client?.queryManager.mutationStore) ?? {};

    const keys = Object.keys(mutationsObj);

    if (keys.length === 0) {
      return [];
    }

    return keys.map((key) => {
      const { mutation, variables, loading, error } = mutationsObj[key];
      return {
        document: mutation,
        variables,
        loading,
        error: getSerializedMutationError(error),
      };
    });
  }
}

function getSerializedMutationError(error: Error | null) {
  if (!error) {
    return null;
  }

  return isApolloError(error)
    ? serializeApolloError(error)
    : serializeError(error);
}

function serializeApolloError(error: ApolloError): SerializedApolloError {
  return {
    clientErrors: error.clientErrors?.map((e) => e.message) ?? [],
    name: "ApolloError",
    networkError: error.networkError
      ? serializeError(error.networkError)
      : undefined,
    message: error.message,
    graphQLErrors: error.graphQLErrors,
    protocolErrors: error.protocolErrors?.map((e) => e.message) ?? [],
  };
}

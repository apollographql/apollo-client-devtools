import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LocalStateError,
} from "@apollo/client";
import type {
  ApolloClient,
  DocumentNode,
  ErrorLike,
  Observable,
} from "@apollo/client";
import { UnconventionalError } from "@apollo/client";
import { ServerParseError } from "@apollo/client";
import { ServerError } from "@apollo/client";
import { isPlainObject } from "@apollo/client/utilities/internal";
import type { FetchPolicy } from "../clientHandler";
import { ClientHandler } from "../clientHandler";
import type {
  MutationV4Details,
  SerializedCombinedGraphQLErrors,
  SerializedCombinedProtocolErrors,
  SerializedServerError,
  SerializedServerParseError,
  SerializedUnconventionalError,
} from "./types";
import type { EmbeddedExplorerResponse, SerializedError } from "@/types";
import { isErrorLike } from "@apollo/client/errors";
import type { JSONObject, JSONValue } from "@/application/types/json";
import { map } from "rxjs";

export class ClientV4Handler extends ClientHandler<ApolloClient> {
  async executeMutation(options: {
    mutation: DocumentNode;
    variables: JSONObject | undefined;
  }): Promise<EmbeddedExplorerResponse> {
    try {
      const result = await this.client.mutate<JSONObject>(options);

      return {
        data: result.data,
        extensions: result.extensions,
        ...getErrorProperties(result.error),
      };
    } catch (error) {
      return getErrorProperties(error);
    }
  }

  executeQuery(options: {
    query: DocumentNode;
    variables: JSONObject | undefined;
    fetchPolicy: FetchPolicy;
  }): Observable<EmbeddedExplorerResponse> {
    return this.client.watchQuery<JSONObject>(options).pipe(
      map(
        (result): EmbeddedExplorerResponse => ({
          data: result.data,
          ...getErrorProperties(result.error),
        })
      )
    );
  }

  executeSubsription({
    subscription,
    variables,
  }: {
    subscription: DocumentNode;
    variables: JSONObject | undefined;
  }): Observable<EmbeddedExplorerResponse> {
    return this.client
      .subscribe<JSONObject>({ query: subscription, variables })
      .pipe(
        map(
          (result): EmbeddedExplorerResponse => ({
            data: result.data,
            extensions: result.extensions,
            ...getErrorProperties(result.error),
          })
        )
      );
  }

  getMutations(): MutationV4Details[] {
    return Object.values(this.client.queryManager.mutationStore ?? {}).map(
      (value) => ({
        document: value.mutation,
        variables: value.variables,
        loading: value.loading,
        error: value.error && serializeError(value.error),
      })
    );
  }

  getQueries(): never[] {
    return [];
  }
}

function serializeError(error: ErrorLike) {
  if (CombinedGraphQLErrors.is(error)) {
    return serializeCombinedGraphQLErrors(error);
  }

  if (CombinedProtocolErrors.is(error)) {
    return serializeCombinedProtocolErrors(error);
  }

  if (LocalStateError.is(error)) {
    return serializeLocalStateError(error);
  }

  if (ServerError.is(error)) {
    return serializeServerError(error);
  }

  if (ServerParseError.is(error)) {
    return serializeServerParseError(error);
  }

  if (UnconventionalError.is(error)) {
    return serializeUnconventionalError(error);
  }

  return serializeErrorLike(error);
}

function serializeErrorLike(error: ErrorLike): SerializedError {
  return { name: error.name, message: error.message, stack: error.stack };
}

function serializeCombinedGraphQLErrors(
  error: CombinedGraphQLErrors
): SerializedCombinedGraphQLErrors {
  return {
    ...serializeErrorLike(error),
    errors: error.errors,
    data: error.data,
    extensions: error.extensions,
  };
}

function serializeCombinedProtocolErrors(
  error: CombinedProtocolErrors
): SerializedCombinedProtocolErrors {
  return {
    ...serializeErrorLike(error),
    errors: error.errors,
  };
}

function serializeLocalStateError(error: LocalStateError) {
  return {
    ...serializeErrorLike(error),
    path: error.path,
    cause: isErrorLike(error.cause)
      ? serializeErrorLike(error.cause)
      : undefined,
  };
}

function serializeServerError(error: ServerError): SerializedServerError {
  return {
    ...serializeErrorLike(error),
    bodyText: error.bodyText,
    statusCode: error.statusCode,
  };
}

function serializeServerParseError(
  error: ServerParseError
): SerializedServerParseError {
  return {
    ...serializeErrorLike(error),
    bodyText: error.bodyText,
    statusCode: error.statusCode,
    cause: isErrorLike(error.cause) ? serializeErrorLike(error) : undefined,
  };
}

function serializeUnconventionalError(
  error: UnconventionalError
): SerializedUnconventionalError {
  return {
    ...serializeErrorLike(error),
    cause: serializeUnknownError(error) as JSONValue,
  };
}

type UnknownError =
  | SerializedError
  | Record<string, unknown>
  | string
  | number
  | boolean;

function serializeUnknownError(
  error: unknown
): UnknownError | UnknownError[] | null | undefined {
  if (error == null) {
    return error;
  }

  if (isErrorLike(error)) {
    return serializeErrorLike(error);
  }

  if (Array.isArray(error)) {
    return error.map(serializeUnknownError) as UnknownError[];
  }

  if (
    typeof error === "string" ||
    typeof error === "boolean" ||
    typeof error === "number"
  ) {
    return error;
  }

  if (typeof error === "symbol" || typeof error === "function") {
    return error.toString();
  }

  if (isPlainObject(error)) {
    return error;
  }
}

function getErrorProperties(error: unknown): EmbeddedExplorerResponse {
  if (CombinedGraphQLErrors.is(error)) {
    return {
      data: error.data,
      errors: error.errors,
      extensions: error.extensions,
    };
  }

  if (isErrorLike(error)) {
    return { error };
  }

  return {};
}

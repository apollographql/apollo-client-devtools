import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LocalStateError,
} from "@apollo/client";
import type {
  ApolloClient,
  DocumentNode,
  ErrorLike,
  ObservableQuery,
} from "@apollo/client";
import { UnconventionalError } from "@apollo/client";
import { ServerParseError } from "@apollo/client";
import { ServerError } from "@apollo/client";
import { isPlainObject } from "@apollo/client/utilities/internal";
import type { FetchPolicy } from "../clientHandler";
import { ClientHandler } from "../clientHandler";
import type {
  MutationV4Details,
  QueryV4Details,
  SerializedCombinedGraphQLErrors,
  SerializedCombinedProtocolErrors,
  SerializedServerError,
  SerializedServerParseError,
  SerializedUnconventionalError,
} from "./types";
import type { EmbeddedExplorerResponse, SerializedError } from "@/types";
import { isErrorLike } from "@apollo/client/errors";
import type { JSONObject, JSONValue } from "@/application/types/json";
// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import type { Observable } from "rxjs";
import { filter, map } from "rxjs";
import { getPrivateAccess } from "@/privateAccess";
import { pick } from "@/application/utilities/pick";

export class ClientV4Handler extends ClientHandler<ApolloClient> {
  protected async executeMutation(options: {
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

  protected async executeQuery(options: {
    query: DocumentNode;
    variables?: JSONObject | undefined;
    fetchPolicy?: FetchPolicy;
  }): Promise<EmbeddedExplorerResponse> {
    const { data, error } = await this.client.query<JSONObject>(options);

    return { data, ...getErrorProperties(error) };
  }

  protected watchQuery(options: {
    query: DocumentNode;
    variables: JSONObject | undefined;
    fetchPolicy: FetchPolicy;
  }): Observable<EmbeddedExplorerResponse> {
    return this.client.watchQuery<JSONObject>(options).pipe(
      filter((result) => result.dataState !== "empty"),
      map(
        (result): EmbeddedExplorerResponse => ({
          data: result.data,
          ...getErrorProperties(result.error),
        })
      )
    );
  }

  protected executeSubscription({
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

  getQueries(): QueryV4Details[] {
    return Array.from(this.client.getObservableQueries("active")).map(
      (oq, idx) => {
        const observableQuery = getPrivateAccess(oq);
        const { pollingInfo } = observableQuery;
        const { networkStatus, error } = observableQuery.getCurrentResult();
        const diff = observableQuery.getCacheDiff();

        return {
          id: String(idx),
          document: observableQuery.query,
          variables: observableQuery.variables,
          cachedData: diff.result,
          options: getQueryOptions(oq),
          networkStatus,
          error: error ? serializeError(error) : null,
          pollInterval: pollingInfo && Math.floor(pollingInfo.interval),
        };
      }
    );
  }
}

function getQueryOptions(observableQuery: ObservableQuery) {
  const { options } = observableQuery;

  const queryOptions = {
    ...pick(options, [
      "context",
      "pollInterval",
      "returnPartialData",
      "refetchWritePolicy",
      "notifyOnNetworkStatusChange",
      "fetchPolicy",
      "errorPolicy",
    ]),
    nextFetchPolicy:
      typeof options.nextFetchPolicy === "function"
        ? "<function>"
        : options.nextFetchPolicy,
  };

  if (queryOptions.nextFetchPolicy == null) {
    delete queryOptions.nextFetchPolicy;
  }

  if (queryOptions.context) {
    queryOptions.context = JSON.parse(
      JSON.stringify(queryOptions.context, (_key, value) => {
        if (typeof value === "function") {
          return `<function>`;
        }

        return value;
      })
    ) as Record<string, unknown>;
  }

  return queryOptions;
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
      error,
      errors: error.errors,
      extensions: error.extensions,
    };
  }

  if (isErrorLike(error)) {
    return { error };
  }

  return {};
}

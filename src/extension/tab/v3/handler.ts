import type {
  Cache,
  ApolloError,
  DocumentNode,
  ObservableQuery,
  NetworkStatus,
} from "@apollo/client-3";
// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import Observable from "zen-observable";
import { isApolloError, type ApolloClient } from "@apollo/client-3";
import type { FetchPolicy } from "../clientHandler";
import { ClientHandler } from "../clientHandler";
import type {
  MutationV3Details,
  MutationStoreValue,
  SerializedApolloError,
  QueryV3Details,
} from "./types";
import { pick } from "@/application/utilities/pick";
import { getPrivateAccess } from "@/privateAccess";
import type { OperationVariables } from "@apollo/client";
import type { EmbeddedExplorerResponse, ExplorerResponse } from "@/types";
import type { JSONObject } from "@/application/types/json";
import { getOperationName } from "@apollo/client/utilities/internal";

export class ClientV3Handler extends ClientHandler<ApolloClient<any>> {
  protected async executeMutation(options: {
    mutation: DocumentNode;
    variables: JSONObject | undefined;
  }): Promise<ExplorerResponse["response"]> {
    try {
      const result = await this.client.mutate(options);

      return {
        data: result.data,
        errors: result.errors,
        extensions: result.extensions,
      };
    } catch (e) {
      const error = e as Error;

      if (isApolloError(error)) {
        return getErrorProperties(error);
      }

      return { error };
    }
  }

  protected executeQuery(options: {
    query: DocumentNode;
    variables: JSONObject | undefined;
    fetchPolicy: FetchPolicy;
  }): Observable<ExplorerResponse["response"]> {
    return new Observable((observer) => {
      const subscription = this.client
        .watchQuery(options)
        .map(
          (result): EmbeddedExplorerResponse => ({
            data: result.data,
            error: result.error,
            errors: result.errors,
          })
        )
        .subscribe({
          next: observer.next.bind(observer),
          complete: observer.complete.bind(observer),
          error: (error: ApolloError) => {
            observer.next(getErrorProperties(error));
            observer.complete();
          },
        });

      return () => subscription.unsubscribe();
    });
  }

  protected executeSubscription({
    subscription,
    variables,
  }: {
    subscription: DocumentNode;
    variables: JSONObject | undefined;
  }): Observable<EmbeddedExplorerResponse> {
    return new Observable((observer) => {
      const sub = this.client
        .subscribe({ query: subscription, variables })
        .map(
          (result): EmbeddedExplorerResponse => ({
            data: result.data,
            errors: result.errors,
          })
        )
        .subscribe({
          next: observer.next.bind(observer),
          complete: observer.complete.bind(observer),
          error: (error: ApolloError) => {
            observer.next(getErrorProperties(error));
            observer.complete();
          },
        });

      return () => sub.unsubscribe();
    });
  }

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

  getQueries(): QueryV3Details[] {
    if (this.client.queryManager.getObservableQueries) {
      return getQueries(
        this.client.queryManager.getObservableQueries("active")
      );
    } else {
      return getQueriesLegacy(this.client.queryManager["queries"]);
    }
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

function getQueries(
  observableQueries: Map<string, ObservableQuery>
): QueryV3Details[] {
  const queries: QueryV3Details[] = [];
  if (observableQueries) {
    observableQueries.forEach((oc, queryId) => {
      const observableQuery = getPrivateAccess(oc);
      const { document, variables } = observableQuery.queryInfo;
      const diff = observableQuery.queryInfo.getDiff();
      if (!document) return;
      const name = getOperationName(document);

      const { pollingInfo } = observableQuery;
      const { networkStatus, error } = observableQuery.getCurrentResult(false);

      queries.push({
        id: queryId,
        document,
        variables,
        cachedData: diff.result,
        options: getQueryOptions(oc),
        networkStatus,
        error: error ? serializeApolloError(error) : undefined,
        pollInterval: pollingInfo && Math.floor(pollingInfo.interval),
      });
    });
  }
  return queries;
}

function getQueryOptions(observableQuery: ObservableQuery) {
  const { options } = observableQuery;

  const queryOptions = {
    ...pick(options, [
      "context",
      "pollInterval",
      "partialRefetch",
      "canonizeResults",
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

// Version of getQueries compatible with Apollo Client versions < 3.4.0
function getQueriesLegacy(
  queryMap: Map<
    string,
    {
      document: DocumentNode;
      variables: OperationVariables;
      diff: Cache.DiffResult<any>;
      networkStatus?: NetworkStatus;
    }
  >
): QueryV3Details[] {
  let queries: QueryV3Details[] = [];
  if (queryMap) {
    queries = [...queryMap.entries()].map(
      ([queryId, { document, variables, diff, networkStatus }]) => ({
        id: queryId,
        document,
        variables,
        cachedData: diff?.result,
        networkStatus: networkStatus ?? 1,
      })
    );
  }
  return queries;
}

function serializeError(error: Error | string) {
  return typeof error !== "object"
    ? { message: String(error), name: typeof error }
    : { message: error.message, name: error.name, stack: error.stack };
}

function getErrorProperties(
  error: ApolloError
): Pick<EmbeddedExplorerResponse, "error" | "errors"> {
  return {
    error,
    errors: error.graphQLErrors.length
      ? error.graphQLErrors
      : error.networkError && "result" in error.networkError
        ? typeof error.networkError?.result === "string"
          ? error.networkError?.result
          : error.networkError?.result.errors ?? []
        : undefined,
  };
}

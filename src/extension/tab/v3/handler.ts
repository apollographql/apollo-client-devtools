import type {
  Cache,
  ApolloError,
  DocumentNode,
  ObservableQuery,
  NetworkStatus,
  ApolloQueryResult,
} from "@apollo/client-3";
// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import type ZenObservable from "zen-observable";
import { catchError, map, Observable, of } from "rxjs";
import { type ApolloClient } from "@apollo/client-3";
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

// inlined to prevent a direct dependency on AC3 from `@apollo/client-devtools-vscode`
function isApolloError(err: unknown): err is ApolloError {
  return !!err && Object.hasOwn(err, "graphQLErrors");
}

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

  protected async executeQuery(options: {
    query: DocumentNode;
    variables?: JSONObject | undefined;
    fetchPolicy?: FetchPolicy;
  }): Promise<EmbeddedExplorerResponse> {
    const result = await this.client.query({
      errorPolicy: "all",
      ...options,
    });

    return toExplorerResponse(result);
  }

  protected watchQuery(options: {
    query: DocumentNode;
    variables: JSONObject | undefined;
    fetchPolicy: FetchPolicy;
  }): Observable<ExplorerResponse["response"]> {
    return toRxjsObservable(this.client.watchQuery(options)).pipe(
      map(toExplorerResponse),
      catchError((error: ApolloError) => of(getErrorProperties(error)))
    );
  }

  protected executeSubscription({
    subscription,
    variables,
  }: {
    subscription: DocumentNode;
    variables: JSONObject | undefined;
  }): Observable<EmbeddedExplorerResponse> {
    return toRxjsObservable(
      this.client.subscribe({ query: subscription, variables })
    ).pipe(
      map(
        (result): EmbeddedExplorerResponse => ({
          data: result.data,
          errors: result.errors,
        })
      ),
      catchError((error: ApolloError) => of(getErrorProperties(error)))
    );
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
    graphQLErrors: error.graphQLErrors ?? [],
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
  error: ApolloError | undefined
): Pick<EmbeddedExplorerResponse, "error" | "errors"> {
  if (!error) {
    return {};
  }

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

function toExplorerResponse({
  data,
  error,
}: ApolloQueryResult<any>): EmbeddedExplorerResponse {
  return { data, ...getErrorProperties(error) };
}

function toRxjsObservable<T>(inner: ZenObservable<T>): Observable<T> {
  return new Observable((observer) => {
    const subscription = inner.subscribe(observer);

    return () => subscription.unsubscribe();
  });
}

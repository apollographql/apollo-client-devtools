import type { Actor, OptionsWithAbortSignal } from "../actor";
import type {
  ApolloClient,
  ApolloError,
  ObservableQuery,
} from "@apollo/client";

// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import Observable from "zen-observable";
import type { DefinitionNode } from "graphql/language";
import { getMainDefinition } from "./helpers";

type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function handleExplorerRequests(
  actor: Actor,
  getClientById: (
    clientId: string
  ) => Pick<ApolloClient, "mutate" | "watchQuery"> | undefined,
  options: OptionsWithAbortSignal = {}
) {
  return actor.on(
    "explorerRequest",
    (message) => {
      const {
        clientId,
        operation: queryAst,
        operationName,
        fetchPolicy,
        variables,
      } = message.payload;

      const client = getClientById(clientId);

      if (!client) {
        throw new Error("Could not find selected client");
      }

      const clonedQueryAst = JSON.parse(JSON.stringify(queryAst)) as Writable<
        typeof queryAst
      >;

      const filteredDefinitions = clonedQueryAst.definitions.reduce(
        (acumm: DefinitionNode[], curr) => {
          if (
            (curr.kind === "OperationDefinition" &&
              curr.name?.value === operationName) ||
            curr.kind !== "OperationDefinition"
          ) {
            acumm.push(curr);
          }

          return acumm;
        },
        []
      );

      clonedQueryAst.definitions = filteredDefinitions;

      const definition = getMainDefinition(clonedQueryAst);

      const operation = (() => {
        if (
          definition.kind === "OperationDefinition" &&
          definition.operation === "mutation"
        ) {
          return new Observable<ObservableQuery.Result<unknown>>((observer) => {
            client
              .mutate({ mutation: clonedQueryAst, variables })
              .then((result) => {
                observer.next(result as ObservableQuery.Result<unknown>);
              });
          });
        } else {
          return client.watchQuery({
            query: clonedQueryAst,
            variables,
            fetchPolicy,
          });
        }
      })();

      const operationObservable = operation?.subscribe(
        (response: ObservableQuery.Result<unknown>) => {
          actor.send({
            type: "explorerResponse",
            payload: { operationName, response },
          });
        },
        (error: ApolloError) => {
          actor.send({
            type: "explorerResponse",
            payload: {
              operationName,
              response: {
                errors: error.graphQLErrors.length
                  ? error.graphQLErrors
                  : error.networkError && "result" in error.networkError
                    ? typeof error.networkError?.result === "string"
                      ? error.networkError?.result
                      : error.networkError?.result.errors ?? []
                    : [],
                error: error,
                data: null,
                loading: false,
                networkStatus: 8, // NetworkStatus.error - we want to prevent importing the enum here
              },
            },
          });
        }
      );

      if (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      ) {
        actor.on(
          "explorerSubscriptionTermination",
          () => {
            operationObservable?.unsubscribe();
          },
          options
        );
        if (options.signal) {
          options.signal.addEventListener(
            "abort",
            () => {
              operationObservable?.unsubscribe();
            },
            { once: true }
          );
        }
      }
    },
    options
  );
}

import {
  ApolloClient,
  ApolloError,
  DocumentNode,
  NetworkStatus,
} from "@apollo/client";

// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import gql from "graphql-tag";
import Observable from "zen-observable";
import { OperationDefinitionNode } from "graphql/language";

// All manifests should contain the same version number so it shouldn't matter
// which one we import from.
import { version as devtoolsVersion } from "../chrome/manifest.json";
import Relay from "../../Relay";
import {
  QueryInfo,
  getQueries,
  getQueriesLegacy,
  getMutations,
  getMainDefinition,
} from "./helpers";
import { ExplorerResponse, QueryResult } from "../../types";
import { EXPLORER_SUBSCRIPTION_TERMINATION } from "../../application/components/Explorer/postMessageHelpers";
import { getPrivateAccess } from "../../privateAccess";
import { JSONObject } from "../../application/types/json";
import { FetchPolicy } from "../../application/components/Explorer/Explorer";
import { createWindowActor } from "../actor";

const DEVTOOLS_KEY = Symbol.for("apollo.devtools");

const actor = createWindowActor();

declare global {
  type TCache = any;

  interface Window {
    __APOLLO_CLIENT__: ApolloClient<TCache>;
    [DEVTOOLS_KEY]?: {
      push(client: ApolloClient<any>): void;
    };
  }
}

type Hook = {
  ApolloClient: ApolloClient<any> | undefined;
  version: string;
  getQueries: () => QueryInfo[];
  getMutations: () => QueryInfo[];
  getCache: () => JSONObject;
};

function initializeHook() {
  const knownClients = new Set<ApolloClient<any>>();
  const hook: Hook = {
    ApolloClient: undefined,
    version: devtoolsVersion,
    getQueries() {
      const ac = getPrivateAccess(hook.ApolloClient);
      if (ac?.queryManager.getObservableQueries) {
        return getQueries(ac.queryManager.getObservableQueries("active"));
      } else {
        return getQueriesLegacy(ac?.queryManager["queries"]);
      }
    },
    getMutations: () => {
      const ac = getPrivateAccess(hook.ApolloClient);
      return getMutations(
        (ac?.queryManager.mutationStore?.getStore
          ? // @ts-expect-error Apollo Client 3.0 - 3.2
            ac.queryManager.mutationStore?.getStore()
          : // Apollo Client 3.3
            ac?.queryManager.mutationStore) ?? {}
      );
    },
    getCache: () => hook.ApolloClient?.cache.extract(true) ?? {},
  };

  Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
    get() {
      return hook;
    },
    configurable: true,
  });

  const clientRelay = new Relay();

  window.addEventListener("message", ({ data }) => {
    clientRelay.broadcast(data);
  });

  // Listen for tab refreshes
  window.onbeforeunload = () => {
    actor.send("disconnectFromDevtools");
  };

  window.addEventListener("load", () => {
    if (hook.ApolloClient) {
      actor.send(
        "connectToDevtools",
        JSON.stringify({
          queries: hook.getQueries(),
          mutations: hook.getMutations(),
          cache: hook.getCache(),
        })
      );
    }
  });

  function handleExplorerResponse(payload: ExplorerResponse) {
    actor.send("explorerResponse", payload);
  }

  function sendHookDataToDevTools(eventName: "update" | "connectToDevtools") {
    actor.send(
      eventName,
      JSON.stringify({
        queries: hook.getQueries(),
        mutations: hook.getMutations(),
        cache: hook.getCache(),
      })
    );
  }

  actor.on("connectToClient", () => {
    if (hook.ApolloClient) {
      sendHookDataToDevTools("connectToDevtools");
    } else {
      findClient();
    }
  });

  actor.on("requestData", () => sendHookDataToDevTools("update"));
  actor.on("explorerRequest", (payload) => {
    const {
      operation: query,
      operationName,
      fetchPolicy,
      variables,
    } = JSON.parse(payload ?? "") as {
      operation: string;
      operationName: string | undefined;
      variables: JSONObject | undefined;
      fetchPolicy: FetchPolicy;
    };

    const queryAst = gql(query);
    const clonedQueryAst = JSON.parse(
      JSON.stringify(queryAst)
    ) as DocumentNode & { definitions: OperationDefinitionNode[] };

    const filteredDefinitions = clonedQueryAst.definitions.reduce<
      OperationDefinitionNode[]
    >((acumm, curr: OperationDefinitionNode) => {
      if (
        (curr.kind === "OperationDefinition" &&
          curr.name?.value === operationName) ||
        curr.kind !== "OperationDefinition"
      ) {
        acumm.push(curr);
      }

      return acumm;
    }, []);

    clonedQueryAst.definitions = filteredDefinitions;

    const definition = getMainDefinition(clonedQueryAst);

    const operation = (() => {
      if (
        definition.kind === "OperationDefinition" &&
        definition.operation === "mutation"
      ) {
        return new Observable((observer) => {
          hook.ApolloClient?.mutate({
            mutation: clonedQueryAst,
            variables,
          }).then((result) => {
            observer.next(result);
          });
        });
      } else {
        return hook.ApolloClient?.watchQuery({
          query: clonedQueryAst,
          variables,
          fetchPolicy,
        });
      }
    })();

    const operationObservable = operation?.subscribe(
      (response: QueryResult) => {
        handleExplorerResponse({
          operationName,
          response,
        });
      },
      (error: ApolloError) => {
        handleExplorerResponse({
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
            networkStatus: NetworkStatus.error,
          },
        });
      }
    );

    if (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    ) {
      clientRelay.listen(EXPLORER_SUBSCRIPTION_TERMINATION, () => {
        operationObservable?.unsubscribe();
      });
    }
  });

  /**
   * Attempt to find the client on a 1-second interval for 10 seconds max
   */
  let interval: NodeJS.Timeout;
  function findClient() {
    let count = 0;

    function initializeDevtoolsHook() {
      if (count++ > 10) {
        clearInterval(interval);
        actor.send("clientNotFound");
      }
      if (window.__APOLLO_CLIENT__) {
        registerClient(window.__APOLLO_CLIENT__);
      }
    }

    clearInterval(interval);
    interval = setInterval(initializeDevtoolsHook, 1000);
    initializeDevtoolsHook(); // call immediately to reduce lag if devtools are already available
  }

  function registerClient(client: ApolloClient<any>) {
    knownClients.add(client);
    hook.ApolloClient = client;
    // TODO: Repurpose this callback. The message it sent was not listened by
    // anything, so the broadcast was useless. Currently the devtools rely on
    // polling the client every second for updates, rather than relying on
    // this callback to update the devtools state.
    // client.__actionHookForDevTools(() => {
    //   if (client !== hook.ApolloClient) {
    //     // if the client has changed, don't send the action hook
    //     return;
    //   }
    // });

    clearInterval(interval);
    // incase initial update was missed because the client wasn't ready, send the create devtools event.
    // devtools checks to see if it's already created, so this won't create duplicate tabs
    sendHookDataToDevTools("connectToDevtools");
  }

  const preExisting = window[DEVTOOLS_KEY];
  window[DEVTOOLS_KEY] = { push: registerClient };
  if (Array.isArray(preExisting)) {
    preExisting.forEach(registerClient);
  }

  findClient();
}

initializeHook();

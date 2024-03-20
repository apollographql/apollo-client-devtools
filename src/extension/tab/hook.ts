import type { ApolloClient, ApolloError, DocumentNode } from "@apollo/client";

// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import gql from "graphql-tag";
import Observable from "zen-observable";
import type { OperationDefinitionNode } from "graphql/language";

// All manifests should contain the same version number so it shouldn't matter
// which one we import from.
import { version as devtoolsVersion } from "../chrome/manifest.json";
import type { QueryInfo } from "./helpers";
import {
  getQueries,
  getQueriesLegacy,
  getMutations,
  getMainDefinition,
} from "./helpers";
import type { QueryResult, SafeAny } from "../../types";
import { getPrivateAccess } from "../../privateAccess";
import type { JSONObject } from "../../application/types/json";
import type { FetchPolicy } from "../../application/components/Explorer/Explorer";
import { createWindowActor } from "../actor";
import type { ClientMessage, DevtoolsRPCMessage } from "../messages";
import { createWindowMessageAdapter } from "../messageAdapters";
import { createRpcHandler } from "../rpc";
import { createId } from "../../utils/createId";

const DEVTOOLS_KEY = Symbol.for("apollo.devtools");

const tab = createWindowActor<ClientMessage>(window);
const handleRpc = createRpcHandler<DevtoolsRPCMessage>(
  createWindowMessageAdapter(window)
);

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
  // Keep a reverse mapping of client -> id to ensure we don't register the same
  // client multiple times.
  const knownClients = new Map<ApolloClient<SafeAny>, string>();
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

  // Listen for tab refreshes
  window.onbeforeunload = () => {
    tab.send({ type: "disconnectFromDevtools" });
  };

  window.addEventListener("load", () => {
    if (hook.ApolloClient) {
      sendHookDataToDevTools("connectToDevtools");
    }
  });

  function getClientData() {
    // We need to JSON stringify the data here in case the cache contains
    // references to irregular data such as `URL` instances which are not
    // cloneable via `structuredClone` (which `window.postMessage` uses to
    // send messages). `JSON.stringify` does however serialize `URL`s into
    // strings properly, so this should ensure that the cache data will be
    // sent without errors.
    //
    // https://github.com/apollographql/apollo-client-devtools/issues/1258
    return JSON.parse(
      JSON.stringify({
        queries: hook.getQueries(),
        mutations: hook.getMutations(),
        cache: hook.getCache(),
      })
    ) as { queries: QueryInfo[]; mutations: QueryInfo[]; cache: JSONObject };
  }

  handleRpc("getClientOperations", getClientData);
  handleRpc("getClients", () => {
    return [...knownClients.entries()].map(([, id], index) => ({
      id,
      name: `Apollo Client ${index}`,
    }));
  });

  function sendHookDataToDevTools(eventName: "connectToDevtools") {
    tab.send({
      type: eventName,
      payload: getClientData(),
    });
  }

  tab.on("connectToClient", () => {
    if (hook.ApolloClient) {
      sendHookDataToDevTools("connectToDevtools");
    } else {
      findClient();
    }
  });

  tab.on("explorerRequest", (message) => {
    const {
      operation: query,
      operationName,
      fetchPolicy,
      variables,
    } = JSON.parse(message.payload ?? "") as {
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
        return new Observable<QueryResult>((observer) => {
          hook.ApolloClient?.mutate({
            mutation: clonedQueryAst,
            variables,
          }).then((result) => {
            observer.next(result as QueryResult);
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
        tab.send({
          type: "explorerResponse",
          payload: { operationName, response },
        });
      },
      (error: ApolloError) => {
        tab.send({
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
      tab.on("explorerSubscriptionTermination", () => {
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
        tab.send({ type: "clientNotFound" });
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
    if (!knownClients.has(client)) {
      const id = createId();
      knownClients.set(client, id);

      watchForTermination(client);

      tab.send({
        type: "registerClient",
        payload: {
          id,
          name: `Apollo Client ${knownClients.size - 1}`,
        },
      });
    }

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
    (preExisting as Array<ApolloClient<any>>).forEach(registerClient);
  }

  findClient();

  function watchForTermination(client: ApolloClient<SafeAny>) {
    const originalStop = client.stop;

    client.stop = () => {
      const clientId = knownClients.get(client)!;
      knownClients.delete(client);
      originalStop.call(client);
      tab.send({ type: "destroyClient", payload: { clientId } });
    };
  }
}

initializeHook();

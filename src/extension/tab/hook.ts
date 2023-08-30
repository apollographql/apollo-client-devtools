import { ApolloClient, ApolloError, NetworkStatus } from "@apollo/client";

// Note that we are intentionally not using Apollo Client's gql and
// Observable exports, as we don't want Apollo Client and its dependencies
// to be loaded into each browser tab, when this hook triggered.
import gql from "graphql-tag";
import Observable from "zen-observable";
import { OperationDefinitionNode } from "graphql/language";

import { version as devtoolsVersion } from "../manifest.json";
import Relay from "../../Relay";
import {
  QueryInfo,
  getQueries,
  getQueriesLegacy,
  getMutations,
  getMainDefinition,
} from "./helpers";
import { ExplorerResponse, QueryResult } from "../../types";
import {
  CLIENT_FOUND,
  DEVTOOLS_INITIALIZED,
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
  EXPLORER_REQUEST,
  EXPLORER_RESPONSE,
  REQUEST_DATA,
  UPDATE,
  RELOADING_TAB,
  RELOAD_TAB_COMPLETE,
} from "../constants";
import { EXPLORER_SUBSCRIPTION_TERMINATION } from "../../application/components/Explorer/postMessageHelpers";

declare global {
  type TCache = any;

  interface Window {
    __APOLLO_CLIENT__: ApolloClient<TCache>;
  }
}

type Hook = {
  ApolloClient: ApolloClient<TCache> | undefined;
  version: string;
  getQueries: () => QueryInfo[];
  getMutations: () => QueryInfo[];
  getCache: () => void;
};

function initializeHook() {
  const hook: Hook = {
    ApolloClient: undefined,
    version: devtoolsVersion,
    getQueries: () => [],
    getMutations: () => [],
    getCache: () => {},
  };

  Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
    get() {
      return hook;
    },
    configurable: true,
  });

  const clientRelay = new Relay();

  clientRelay.addConnection("tab", (message) => {
    window.postMessage(message, "*");
  });

  window.addEventListener("message", ({ data }) => {
    clientRelay.broadcast(data);
  });

  function sendMessageToTab<TPayload>(message: string, payload?: TPayload) {
    clientRelay.send({
      to: "tab",
      message,
      payload,
    });
  }

  // Listen for tab refreshes
  window.onbeforeunload = () => {
    sendMessageToTab(RELOADING_TAB);
  };

  window.addEventListener("load", () => {
    sendMessageToTab(RELOAD_TAB_COMPLETE, {
      ApolloClient: !!hook.ApolloClient,
    });
  });

  function handleActionHookForDevtools() {
    sendMessageToTab(ACTION_HOOK_FIRED);
  }

  function handleExplorerResponse(payload: ExplorerResponse) {
    sendMessageToTab(EXPLORER_RESPONSE, payload);
  }

  function sendHookDataToDevTools(eventName: typeof CREATE_DEVTOOLS_PANEL | typeof UPDATE) {
    // Tab Relay forwards this the devtools
    sendMessageToTab(
      eventName,
      JSON.stringify({
        queries: hook.getQueries(),
        mutations: hook.getMutations(),
        cache: hook.getCache(),
      })
    );
  }

  clientRelay.listen(DEVTOOLS_INITIALIZED, () => {
    if (hook.ApolloClient) {
      sendHookDataToDevTools(CREATE_DEVTOOLS_PANEL);
    } else {
      // try finding client again, if it's found findClient will send the CREATE_DEVTOOLS_PANEL event
      findClient()
    }
  });

  clientRelay.listen(REQUEST_DATA, () => sendHookDataToDevTools(UPDATE));

  clientRelay.listen(EXPLORER_REQUEST, ({ payload }) => {
    const {
      operation: query,
      operationName,
      fetchPolicy,
      variables,
    } = JSON.parse(payload);

    const queryAst = gql(query);

    const clonedQueryAst = JSON.parse(JSON.stringify(queryAst));

    const filteredDefinitions = clonedQueryAst.definitions.reduce(
      (acumm: any, curr: OperationDefinitionNode) => {
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
              ? error.networkError?.result.errors
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
  function findClient() {
    // eslint-disable-next-line prefer-const
    let interval;
    let count = 0;

    function initializeDevtoolsHook() {
      if (count++ > 10) clearInterval(interval);
      if (window.__APOLLO_CLIENT__) {
        hook.ApolloClient = window.__APOLLO_CLIENT__;
        hook.ApolloClient.__actionHookForDevTools(handleActionHookForDevtools);
        hook.getQueries = () =>{
          if((hook.ApolloClient as any).queryManager.getObservableQueries){
            return getQueries((hook.ApolloClient as any).queryManager.getObservableQueries("active"));
          } else {
            return getQueriesLegacy((hook.ApolloClient as any).queryManager.queries);
          }
        }
        hook.getMutations = () =>
          getMutations(
            (hook.ApolloClient as any).queryManager.mutationStore?.getStore
              ? // Apollo Client 3.0 - 3.2
                (
                  hook.ApolloClient as any
                ).queryManager.mutationStore?.getStore()
              : // Apollo Client 3.3
                (hook.ApolloClient as any).queryManager.mutationStore
          );
        hook.getCache = () => hook.ApolloClient?.cache.extract(true);

        clearInterval(interval);
        sendMessageToTab(CLIENT_FOUND);
        // incase initial update was missed because the client wasn't ready, send the create devtools event.
        // devtools checks to see if it's already created, so this won't create duplicate tabs
        sendHookDataToDevTools(CREATE_DEVTOOLS_PANEL);
      }
    }

    interval = setInterval(initializeDevtoolsHook, 1000);
    initializeDevtoolsHook() // call immediately to reduce lag if devtools are already available
  }

  findClient();
}

initializeHook();

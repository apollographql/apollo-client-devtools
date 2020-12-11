import { gql, Observable, ApolloClient } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { version as devtoolsVersion } from "../manifest.json";
import Relay from "../../Relay";
import { QueryInfo, getQueries, getMutations } from "./helpers";
import { GraphiQLResponse, QueryResult } from '../../types';
import {
  CLIENT_FOUND,
  DEVTOOLS_INITIALIZED,
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED,
  GRAPHIQL_REQUEST,
  GRAPHIQL_RESPONSE,
  REQUEST_DATA,
  UPDATE,
  RELOADING_TAB,
  RELOAD_TAB_COMPLETE,
} from "../constants";

declare global {
  type TCache = any;

  interface Window {
    __APOLLO_CLIENT__: ApolloClient<TCache>
  }
}

type Hook = {
  ApolloClient: ApolloClient<TCache> | undefined;
  version: string;
  getQueries: () => QueryInfo[];
  getMutations: () => QueryInfo[];
  getCache: () => void;
}

function initializeHook() {
  const hook: Hook = {
    ApolloClient: undefined,
    version: devtoolsVersion,
    getQueries: () => ([]),
    getMutations: () => ([]),
    getCache: () => {},
  };

  Object.defineProperty(window, '__APOLLO_DEVTOOLS_GLOBAL_HOOK__', {
    get() {
      return hook;
    },
  });

  const clientRelay = new Relay();

  clientRelay.addConnection('tab', message => {
    window.postMessage(message, '*');
  });

  window.addEventListener('message', ({ data }) => {
    clientRelay.broadcast(data);
  });

  function sendMessageToTab<TPayload>(message: string, payload?: TPayload) {
    clientRelay.send({
      to: 'tab',
      message,
      payload,
    });
  }

  // Listen for tab refreshes
  window.onbeforeunload = () => {
    sendMessageToTab(RELOADING_TAB);
  };

  window.onload = () => {
    sendMessageToTab(RELOAD_TAB_COMPLETE, { ApolloClient: !!hook.ApolloClient });
  };

  function handleActionHookForDevtools() {
    sendMessageToTab(ACTION_HOOK_FIRED);
  }

  function handleGraphiQlResponse(payload: GraphiQLResponse) {
    sendMessageToTab(GRAPHIQL_RESPONSE, payload);
  }

  clientRelay.listen(DEVTOOLS_INITIALIZED, () => {
    if (hook.ApolloClient) {

      // Tab Relay forwards this the devtools
      sendMessageToTab(CREATE_DEVTOOLS_PANEL,
        JSON.stringify({
          queries: hook.getQueries(),
          mutations: hook.getMutations(),
          cache: hook.getCache(),
        })
      );
    }
  });

  clientRelay.listen(REQUEST_DATA, () => {
    // Tab Relay forwards this the devtools
    sendMessageToTab(UPDATE,
      JSON.stringify({
        queries: hook.getQueries(),
        mutations: hook.getMutations(),
        cache: hook.getCache(),
      })
    );
  });

  clientRelay.listen(GRAPHIQL_REQUEST, ({ payload }) => {
    const { query, operationName, fetchPolicy, variables } = JSON.parse(payload);

    const queryAst = gql(query);
    const definition = getMainDefinition(queryAst);

    const operation = (() => {
      if (definition.kind === 'OperationDefinition' && definition.operation === 'mutation') {
        return new Observable(observer => {
          hook.ApolloClient!.mutate({
              mutation: queryAst,
              variables,
          }).then(result => {
            observer.next(result);
          });
        });
      } else {
        return hook.ApolloClient!.watchQuery({
          query: queryAst,
          variables,
          fetchPolicy,
        });
      }
    })();

    operation.subscribe((response: QueryResult) => {
      handleGraphiQlResponse({
        operationName,
        response,
      });
    });
  });

  function findClient() {
    let interval;
    let count = 0;

    function initializeDevtoolsHook() {
      if (count++ > 10) clearInterval(interval);
      if (!!window.__APOLLO_CLIENT__) {
        hook.ApolloClient = window.__APOLLO_CLIENT__;
        hook.ApolloClient.__actionHookForDevTools(handleActionHookForDevtools);
        hook.getQueries = () => getQueries((hook.ApolloClient as any).queryManager.queries);
        hook.getMutations = () => getMutations(
          // Apollo Client 3.0 - 3.2
          (hook.ApolloClient as any).queryManager.mutationStore?.getStore() ??
          // Apollo Client 3.3
          (hook.ApolloClient as any).queryManager.mutationStore);
        hook.getCache = () => hook.ApolloClient!.cache.extract(true);

        clearInterval(interval);
        sendMessageToTab(CLIENT_FOUND);
      }
    }

    interval = setInterval(initializeDevtoolsHook, 1000);
  }

  // Attempt to find the client on a 1-second interval for 10 seconds max
  findClient();
}

initializeHook();

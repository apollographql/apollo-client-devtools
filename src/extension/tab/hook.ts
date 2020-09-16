import { gql, Observable, ApolloClient } from "@apollo/client";
import { version as devtoolsVersion } from "../manifest.json";
import Relay from '../../Relay';
import { 
  DEVTOOLS_INITIALIZED,
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED, 
  GRAPHIQL_REQUEST,
  GRAPHIQL_RESPONSE,
  REQUEST_DATA,
  UPDATE,
} from '../constants';

declare global {
  type TCache = any;

  interface Window {
    __APOLLO_CLIENT__: ApolloClient<TCache>
  }
}

type Hook = {
  ApolloClient: ApolloClient<TCache> | undefined;
  version: string;
  getQueries: () => void;
  getMutations: () => void;
  getCache: () => void;
}

function initializeHook() {
  const hook: Hook = {
    ApolloClient: undefined,
    version: devtoolsVersion,
    getQueries: () => {},
    getMutations: () => {},
    getCache: () => {},
  };

  Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
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

  // TODO: Handshake to get the tab id?

  function sendMessageToTab<TPayload>(message: string, payload?: TPayload) {
    clientRelay.send({
      to: 'tab',
      message,
      payload,
    });
  }

  function handleActionHookForDevtools() {
    sendMessageToTab(ACTION_HOOK_FIRED);
  }

  function handleGraphiQlResponse(payload) {
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

  clientRelay.listen(GRAPHIQL_REQUEST, ({ detail: { payload }}) => {
    console.log('Client received graphiql request', JSON.parse(payload));
    const { query, operationName, fetchPolicy, variables } = JSON.parse(payload);
    // TODO: Send query to hook.ApolloClient & return the response
    // TODO: Handle mutations
    // TODO: Handle `cache-only` requests
    // TODO: @client?
    const operation = hook.ApolloClient!.watchQuery({
      query: gql(query),
      variables,
      fetchPolicy,
    });

    operation.subscribe(response => {
      console.log('SUBSCRIBE RESPONSE', response);
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
        hook.getQueries = () => (hook.ApolloClient as any).queryManager.queries;
        hook.getMutations = () => (hook.ApolloClient as any).queryManager.mutationStore.getStore();
        hook.getCache = () => hook.ApolloClient!.cache.extract(true);
  
        clearInterval(interval);
      }
    }
    
    interval = setInterval(initializeDevtoolsHook, 1000);
  }

  // Attempt to find the client on a 1-second interval for 10 seconds max
  findClient();
}

initializeHook();

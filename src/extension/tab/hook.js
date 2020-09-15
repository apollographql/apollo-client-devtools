import { gql, Observable } from "@apollo/client";
import { 
  CREATE_DEVTOOLS_PANEL,
  ACTION_HOOK_FIRED, 
  GRAPHIQL_RESPONSE,
  UPDATE,
} from '../constants';

function initializeHook(devtoolsVersion) {
  const hook = {
    ApolloClient: null,
    version: devtoolsVersion,
    getQueries: () => null,
    getMutations: () => null,
    getCache: () => null,
  };

  Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
    get() {
      return hook;
    },
  });

  function handleActionHookForDevtools() {
    window.postMessage({
      message: ACTION_HOOK_FIRED,
      to: 'tab',
    });
  }

  function handleGraphiQlResponse(payload) {
    window.postMessage({
      message: GRAPHIQL_RESPONSE,
      to: 'tab',
      payload,
    });
  }
  
  function findClient() {
    let interval;
    let count = 0;
  
    function initializeDevtoolsHook() {
      if (count++ > 10) clearInterval(interval);
      if (!!window.__APOLLO_CLIENT__) {
        hook.ApolloClient = window.__APOLLO_CLIENT__;
        hook.ApolloClient.__actionHookForDevTools(handleActionHookForDevtools);
        hook.getQueries = () => hook.ApolloClient.queryManager.queries;
        hook.getMutations = () => hook.ApolloClient.queryManager.mutationStore.getStore();
        hook.getCache = () => hook.ApolloClient.cache.extract(true);
  
        clearInterval(interval);
      }
    }
    
    interval = setInterval(initializeDevtoolsHook, 1000);
  }

  // Attempt to find the client on a 1-second interval for 10 seconds max
  findClient();

  window.addEventListener('message', ({ data }) => {
    if (data?.message === 'devtools-initialized') {
      if (hook.ApolloClient) {
        window.postMessage({
          message: CREATE_DEVTOOLS_PANEL,
          to: 'tab', // Tab Relay forwards this the devtools
          payload: JSON.stringify({
            queries: hook.getQueries(),
            mutations: hook.getMutations(),
            cache: hook.getCache(),
          }),
        });
      }
    }

    if (data?.message === 'request-update') {
      window.postMessage({
        message: UPDATE,
        to: 'tab', // Tab Relay forwards this the devtools
        payload: JSON.stringify({
          queries: hook.getQueries(),
          mutations: hook.getMutations(),
          cache: hook.getCache(),
        }),
      });
    }

    if (data?.message === 'graphiql-request') {
      console.log('Client received graphiql request', JSON.parse(data.payload));
      const { query, operationName, fetchPolicy, variables } = JSON.parse(data.payload);
      // TODO: Send query to hook.ApolloClient & return the response
      // TODO: Handle mutations
      // TODO: Handle `cache-only` requests
      // TODO: @client?
      const operation = hook.ApolloClient.watchQuery({
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
    }
  });
}

initializeHook();
export { initializeHook };

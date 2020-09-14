function filterQueryInfo(queryInfoMap) {
  const filteredQueryInfo = {};
  queryInfoMap.forEach((value, key) => {
    filteredQueryInfo[key] = {
      document: value.document,
      graphQLErrors: value.graphQLErrors,
      networkError: value.networkError,
      networkStatus: value.networkStatus,
      variables: value.variables,
    };
  });
  return filteredQueryInfo;
}

function initializeHook(window, devtoolsVersion) {
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
      message: 'action-hook-fired',
      to: 'tab:background:devtools',
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
          message: 'create-devtools-panel',
          to: 'tab:background:devtools',
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
        message: 'update',
        to: 'tab:background:devtools',
        payload: JSON.stringify({
          queries: hook.getQueries(),
          mutations: hook.getMutations(),
          cache: hook.getCache(),
        }),
      });
    }

    if (data?.message === 'graphiql-request') {
      console.log('Client received graphiql request', data);
      // TODO: Send query to hook.ApolloClient & return the response
      // TODO: Handle mutations
      // TODO: Handle `cache-only` requests
      // hook.ApolloClient.watchQuery({
      //   ...data,
      // });

      // Oh no, what about gql?
    }
  });
}

export { initializeHook };

function initializeHook(window, devtoolsVersion) {
  const hook = {
    ApolloClient: null,
    version: devtoolsVersion,
    queries: null,
    mutations: null,
    cache: null,
    getQueries: () => null,
    getMutations: () => null,
    getCache: () => null,
  };

  Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
    get() {
      return hook;
    },
  });

  function handleActionHookForDevtools({
    state: { 
      queries,
      mutations,
    },
    dataWithOptimisticResults
  }) {
    hook.queries = queries;
    hook.mutations = mutations;
    hook.cache = dataWithOptimisticResults;

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
        hook.getQueries = () => hook.ApolloClient.queryManager.getQueryStore();
        hook.getMutations = () => hook.ApolloClient.queryManager.mutationStore.getStore();
        hook.getCache = () => hook.ApolloClient.cache.extract(true);
  
        clearInterval(interval);
      }
    }
    
    // Attempt to find the client on a 1-second interval for 10 seconds max
    interval = setInterval(initializeDevtoolsHook, 1000);
  }

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
  });
}

export { initializeHook };

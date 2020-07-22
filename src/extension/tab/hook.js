function initializeHook(window, devtoolsVersion) {
  const hook = {
    ApolloClient: null,
    version: devtoolsVersion,
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
  
        window.postMessage({
          message: 'create-devtools-panel',
          to: 'tab:background:devtools',
        });
  
        clearInterval(interval);
      }
    }
    
    // Attempt to find the client on a 1-second interval for 10 seconds max
    interval = setInterval(initializeDevtoolsHook, 1000);
  }

  window.addEventListener('message', ({ data }) => {
    console.log(data);
    if (data?.message === 'devtools-initialized') {
      findClient();
    }

    if (data?.message === 'request-cache-extract') {
      const cache = hook.ApolloClient.cache.extract();
      window.postMessage({
        message: 'cache-extracted',
        to: 'tab',
        payload: JSON.stringify(cache)
      });
    }
  });
}

export { initializeHook };
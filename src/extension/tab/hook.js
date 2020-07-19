// IMPORTANT: this script is injected into every page!!!

// Connect to the content-script 
  // window.addEventListener('message', () => {});
  // window.postMessage(message);
  // Apollo Client alerts that something has changed
  // Window passes this to the devtools-{id}
  // Window receives requests from devtools-{id} to pull data
  // Window sends requested data to the devtools-{id}

  function initializeHook(window, devtoolsVersion) {
    const hook = {
      ApolloClient: null,
    };

    Object.defineProperty(window, "__APOLLO_DEVTOOLS_GLOBAL_HOOK__", {
      get() {
        return hook;
      },
    });

    window.addEventListener('message', message => {
      console.log(message);
      // Is Apollo Client present?
      // 
    });

    function handleActionHookForDevtools() {
      window.postMessage({
        message: 'actionHookFired',
        to: 'tab',
      });
    }

    let interval;
    let count = 0;
    function findClient() {
      console.log('findClient: ', !!window.__APOLLO_CLIENT__);
      // only try for 10 seconds
      if (count++ > 10) clearInterval(interval);
      if (!!window.__APOLLO_CLIENT__) {
        hook.ApolloClient = window.__APOLLO_CLIENT__;
        hook.ApolloClient.__actionHookForDevTools(handleActionHookForDevtools);
        clearInterval(interval);
      }
    }
    
    interval = setInterval(findClient, 1000);
  }

  export { initializeHook 
  };
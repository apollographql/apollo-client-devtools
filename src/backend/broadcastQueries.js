// Apollo Client 2 stores query information in an object, whereas AC3 uses
// a Map. Devtools are expecting to work with an object, so this function
// will convert an AC3 query info Map to an object, while also filtering out
// the query details we don't need.
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

function getQueries(client) {
  if (!client || !client.queryManager) {
    return () => {};
  }

  // Apollo Client 2
  if (client.queryManager.queryStore) {
    if (client.queryManager.queryStore.getStore) {
      return () => client.queryManager.queryStore.getStore();
    }
  // Apollo Client 3
  } else if (client.queryManager.queries) {
    return () => filterQueryInfo(client.queryManager.queries);
  }
}

function getMutations(client) {
  if (!client || !client.queryManager) {
    return () => {};
  }

  // Apollo Client 2 to 3.2
  if (client.queryManager.mutationStore && client.queryManager.mutationStore.getStore) {
    return () => client.queryManager.mutationStore.getStore();
  } else {
  // Apollo Client 3.3+
    return () => client.queryManager.mutationStore;
  }
}

export const initBroadCastEvents = (hook, bridge) => {
  let client = null;
  let queries = () => {};
  let mutations = () => {};

  // Counters for diagnostics
  let counter = 0;

  // Next broadcast to be sent
  let enqueued = null;

  // Whether backend is ready for another broadcast
  let acknowledged = true;

  // Threshold for warning about state size in Megabytes
  let warnMB = 10;

  // Minimize impact to webpage. Serializing large state could cause jank
  function scheduleBroadcast() {
    acknowledged = false;
    requestIdleCallback(sendBroadcast, { timeout: 120 /*max 2min*/ });
  }

  // Send the Apollo broadcast to the devtools
  function sendBroadcast() {
    const msg = JSON.stringify(enqueued);
    bridge.send("broadcast:new", msg);
    enqueued = null;

    if (msg.length > warnMB * 1000000) {
      const currentMB = msg.length / 1000000;
      console.warn(
        `Apollo DevTools serialized state is ${currentMB.toFixed(1)} MB. ` +
        "This may cause performance degradation.",
      );
      // Warn again if it doubles
      warnMB = currentMB * 2;
    }
  }

  let logger = ({
    _,
    dataWithOptimisticResults: inspector,
  }) => {
    counter++;
    enqueued = {
      counter,
      queries: queries(),
      mutations: mutations(),
      inspector,
    };
    if (acknowledged) {
      scheduleBroadcast();
    }
  };

  // The backend has acknowledged receipt of a broadcast
  bridge.on("broadcast:ack", data => {
    acknowledged = true;
    if (enqueued) {
      scheduleBroadcast();
    }
  });

  bridge.on("panel:ready", () => {
    client = hook.ApolloClient;

    queries = getQueries(client);
    mutations = getMutations(client);

    const initial = {
      queries: queries(),
      mutations: mutations(),
      inspector: client.cache.extract(true),
    };

    bridge.send("broadcast:new", JSON.stringify(initial));
  });

  hook.ApolloClient.__actionHookForDevTools(logger);
};

export const initBroadCastEvents = (hook, bridge) => {
  //Counters for diagnostics
  let counter = 0;
  let sent = 0;
  //Next broadcast to be sent
  let enqueued = null;
  //Whether backend is ready for another broadcast
  let acknowledged = true;
  //Threshold for warning about state size in Megabytes
  let warnMB = 10;

  //Minimize impact to webpage. Serializing large state could cause Jank
  function scheduleBroadcast() {
    acknowledged = false;
    requestIdleCallback(sendBroadcast, { timeout: 120 /*max 2min*/ });
  }

  //Send the Apollo broadcast to the devtools
  function sendBroadcast() {
    sent++;
    const msg = JSON.stringify(enqueued);
    bridge.send("broadcast:new", msg);
    enqueued = null;

    if (msg.length > warnMB * 1000000) {
      const currentMB = msg.length / 1000000;
      console.warn(
        "Apollo DevTools serialized state is " +
          currentMB.toFixed(1) +
          "MB. This may cause performance degradation.",
      );
      warnMB = currentMB * 2; //Warn again if it doubles.
    }
  }

  let logger = ({
    state: { queries, mutations },
    // XXX replace with universal store format compat way of this
    dataWithOptimisticResults: inspector,
  }) => {
    counter++;
    enqueued = {
      counter,
      queries,
      mutations,
      inspector,
    };
    if (acknowledged) {
      scheduleBroadcast();
    }
  };

  //The backend has acknoledged reciept of a broadcast
  bridge.on("broadcast:ack", data => {
    acknowledged = true;
    if (enqueued) {
      scheduleBroadcast();
    }
  });

  bridge.on("panel:ready", () => {
    const client = hook.ApolloClient;
    const initial = {
      queries: client.queryManager
        ? client.queryManager.queryStore.getStore()
        : {},
      mutations: client.queryManager
        ? client.queryManager.mutationStore.getStore()
        : {},
      inspector: client.cache.extract(true),
    };
    bridge.send("broadcast:new", JSON.stringify(initial));
  });

  hook.ApolloClient.__actionHookForDevTools(logger);
};

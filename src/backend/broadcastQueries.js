export const initBroadCastEvents = (hook, bridge) => {
  let logger = ({
    state: { queries, mutations },
    // XXX replace with universal store format compat way of this
    dataWithOptimisticResults: inspector,
  }) => {
    bridge.send(
      "broadcast:new",
      JSON.stringify({
        queries,
        mutations,
        inspector,
      })
    );
  };

  if (hook.actionLog.length) {
    bridge.send("broadcast:initial", JSON.stringify(hook.actionLog));
  }

  hook.ApolloClient.__actionHookForDevTools(logger);
};

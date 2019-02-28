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
      }),
    );
  };

  const attachApolloClientToDevTools = (client) => {
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

    client.__actionHookForDevTools(logger);
  }

  const updateDevToolsClients = (clients) => {
    const activeClient = hook.ApolloClient;
    if(clients) {
      const data = clients.map(item => ({
        id: item.id, 
        name: item.name || 'Unknown',
        isSelected: item.client === activeClient,
      }));
      bridge.send("broadcast:clients-set", JSON.stringify(data));
    }
  }

  bridge.on("panel:ready", () => {
    const client = hook.ApolloClient;
    attachApolloClientToDevTools(client);

    const clientsApi = hook.ApolloClients;

    if(clientsApi) {
      updateDevToolsClients(clientsApi.getClients());

      // when new Apollo-client is added, update the list
      clientsApi.attachUpdateListener(() => {
        updateDevToolsClients(clientsApi.getClients());
      });
    }
  });

  bridge.on("broadcast:active-client-set", (_data) => {
    const clientsApi = hook.ApolloClients;
    const newActiveClient = clientsApi.getById(Number(JSON.parse(_data)));

    // stop sending updates from inactive Apollo-client
    hook.ApolloClient.__actionHookForDevTools(() => {});

    // set new selected/active Apollo-client for dev-tools
    hook.ApolloClient = newActiveClient;
    attachApolloClientToDevTools(newActiveClient);
    
    // update selection in clients list
    updateDevToolsClients(clientsApi.getClients());
  });
};

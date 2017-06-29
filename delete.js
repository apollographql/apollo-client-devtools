function () {
    let id = 1;

    if (window.__APOLLO_CLIENT__) {
        window.__action_log__ = [];

        const logger = (logItem) => {
        // Only log Apollo actions for now
        // type check 'type' to avoid issues with thunks and other middlewares
        if (typeof logItem.action.type !== 'string' || logItem.action.type.split('_')[0] !== 'APOLLO') {
            return;
        }

        id++;

        logItem.id = id;

        window.__action_log__.push(logItem);

        if (window.__action_log__.length > 10) {
            window.__action_log__.shift();
        }
        }

        window.__action_log__.push({
        id: 0,
        action: { type: 'INIT' },
        state: window.__APOLLO_CLIENT__.queryManager.getApolloState(),
        dataWithOptimisticResults: window.__APOLLO_CLIENT__.queryManager.getDataWithOptimisticResults(),
        });

        window.__APOLLO_CLIENT__.__actionHookForDevTools(logger);
        }
import React, { Component } from 'react';
import { ApolloClient, ApolloProvider } from 'react-apollo';
import configureStore from './configureStore'
import evalInPage from './evalInPage';
import Panel from './components/Panel';

const client = new ApolloClient();
const store = configureStore({
  apollo: client.reducer()
});

export default class App extends Component {
  componentDidMount () {
    this.initLogger()
  }

  initLogger = () => {
    evalInPage(`
      (function () {
        if (window.__APOLLO_CLIENT__) {
          window.__action_log__ = [];

          const logger = (logItem) => {
            // Only log Apollo actions for now
            // type check 'type' to avoid issues with thunks and other middlewares
            if (typeof logItem.action.type !== 'string' || logItem.action.type.split('_')[0] !== 'APOLLO') {
              return;
            }

            window.postMessage({ APOLLO_ACTION: logItem }, '*')
          }

          window.__APOLLO_CLIENT__.__actionHookForDevTools(logger);
          return window.__APOLLO_CLIENT__.store.getState()
        }

        return null;
      })()
    `, result => {
        store.dispatch({
          type: '@@HYDRATE',
          state: result
        })
    });

    this.backgroundPageConnection = chrome.runtime.connect({
      name: 'panel'
    });

    this.backgroundPageConnection.onMessage.addListener((request, sender) => {
      console.log(request)
      store.dispatch(request.action)
    });

    this.backgroundPageConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });
  }

  render () {
    return (
      <ApolloProvider client={client} store={store}>
        <Panel />
      </ApolloProvider>
    )
  };
}

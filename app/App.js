import React, { Component } from 'react';
import { ApolloClient, ApolloProvider } from 'react-apollo';
import evalInPage from './evalInPage';
import Panel from './components/Panel';

export default class App extends Component {
  state = {
    client: null
  }

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
          return window.__APOLLO_CLIENT__.store.getState().apollo
        }

        return null;
      })()
    `, result => {
      this.initClient({ apollo: result })
    });

    this.backgroundPageConnection = chrome.runtime.connect({
      name: 'panel'
    });

    this.backgroundPageConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });

    this.backgroundPageConnection.onMessage.addListener((request, sender) => {
      console.log(request)
    });
  }

  initClient = initialState => {
    const client = new ApolloClient({
      initialState,
      connectToDevTools: true
    });

    this.setState({ client });
  }

  render () {
    if (!this.state.client) return null

    return (
      <ApolloClient client={this.state.client}>
        {/* <Panel /> */}
        {JSON.stringify(this.state.client.getInitialState(), null, 2)}
      </ApolloClient>
    )
  };
}

import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { ApolloClient, ApolloProvider } from 'react-apollo';
import evalInPage from './evalInPage';
import Panel from './components/Panel';

function makeHydratable(reducer, hydrateActionType) {
  return function (state, action) {
    switch (action.type) {
    case hydrateActionType:
      return reducer(action.state, action);
    default:
      return reducer(state, action);
    }
  }
}

const client = new ApolloClient();

const rootReducer = makeHydratable(combineReducers({
  apollo: client.reducer()
}), '@@HYDRATE');

const store = createStore(rootReducer);

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

    this.backgroundPageConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId
    });

    this.backgroundPageConnection.onMessage.addListener((request, sender) => {
      console.log(request)
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

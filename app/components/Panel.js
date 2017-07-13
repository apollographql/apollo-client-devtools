import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { getMutationDefinition } from 'apollo-client';

import WatchedQueries from './WatchedQueries';
import Mutations from './Mutations';
import Explorer from './Explorer';
import Inspector from './Inspector';
import Apollo from './Images/Apollo';
import GraphQL from './Images/GraphQL';
import Store from './Images/Store';
import Queries from './Images/Queries';
import Logger from './Logger';
import { Sidebar } from './Sidebar';
import evalInPage from '../evalInPage';
import { inspectorHook } from './Inspector/Inspector'; //inspectorHook is a js function
import '../style.less';

function lastActionId(actionLog) {
  if (actionLog && actionLog.length) {
    const lastApolloState = actionLog[actionLog.length - 1];
    return lastApolloState && lastApolloState.id;
  }
  return null;
}

export default class Panel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active: 'graphiql',
      actionLog: [],
      runQuery: undefined,
      runVariables: undefined,
      selectedRequestId: undefined,
      automaticallyRunQuery: undefined
    };

    let backgroundPageConnection = chrome.runtime.connect({
      // sending tabId as name to make connection one-step process
      name: chrome.devtools.inspectedWindow.tabId.toString()
    });

    backgroundPageConnection.onMessage.addListener((logItem, sender) => {
      let slimItem;

      if (logItem.queries) {
        slimItem = {
          state: { queries: logItem.queries }
        };
      }

      if (logItem.mutations) {
        let mutations = logItem.mutations;
        let mutationsArray = Object.keys(mutations).map(function(key, index) {
          return [key, mutations[key]];
        });
        // chose 10 arbitrary so we only display 10 mutations in log
        mutationsArray = mutationsArray.slice(
          mutationsArray.length - 10,
          mutationsArray.length
        );
        mutations = {};
        mutationsArray.forEach(function(m) {
          mutations[m[0]] = m[1];
        });
        slimItem = {
          state: { mutations: logItem.mutations }
        };
      }
      this.setState({
        actionLog: [slimItem]
      });
    });

    this.onRun = this.onRun.bind(this);
    this.selectLogItem = this.selectLogItem.bind(this);
  }
  componentDidMount() {
    this.lastActionId = null;
    this.initLogger();
  }

  initLogger() {
    evalInPage(
      `
      (function () {
        if (window.__APOLLO_CLIENT__) {
          // window.__action_log__ initialized in hook.js
          window.__action_log__.push({
            dataWithOptimisticResults: window.__APOLLO_CLIENT__.queryManager.getDataWithOptimisticResults(),
          });
        }
      })()
    `,
      result => {
        // Nothing
      }
    );
  }

  componentWillUnmount() {
    clearTimeout(this._interval);
  }

  selectedApolloLog() {
    if (this.state.actionLog.length < 1) {
      //eventually replace this with loading symbol
      this.state.actionLog[0] = {};
    }
    const logIsPopulated = this.state.actionLog && this.state.actionLog.length;

    if (this.state.selectedRequestId) {
      const filtered = this.state.actionLog.filter(item => {
        return item.id === this.state.selectedRequestId;
      });

      return filtered.length && filtered[0];
    }
    return this.state.actionLog[this.state.actionLog.length - 1];
  }

  onRun(queryString, variables, tab, automaticallyRunQuery) {
    ga('send', 'event', tab, 'run-in-graphiql');
    this.setState({
      active: 'graphiql',
      runQuery: queryString,
      runVariables: variables ? JSON.stringify(variables, null, 2) : '',
      automaticallyRunQuery
    });
  }

  switchPane(pane) {
    this.setState({
      active: pane,
      // Don't leave this stuff around except when actively clicking the run
      // button.
      runQuery: undefined,
      runVariables: undefined
    });
  }

  selectLogItem(id) {
    this.setState({
      selectedRequestId: id
    });
  }

  render() {
    const { active, actionLog } = this.state;
    const selectedLog = this.selectedApolloLog();
    let body;
    switch (active) {
      case 'queries':
        // XXX this won't work in the dev tools (probably does work now)
        body =
          selectedLog &&
          <WatchedQueries state={selectedLog.state} onRun={this.onRun} />;
        break;
      case 'mutations':
        // XXX this won't work in the dev tools (probably does work now)
        body =
          selectedLog &&
          <Mutations state={selectedLog.state} onRun={this.onRun} />;
        break;
      case 'store':
        body = selectedLog && <Inspector />;
        break;
      case 'graphiql':
        body = (
          <Explorer
            query={this.state.runQuery}
            variables={this.state.runVariables}
            automaticallyRunQuery={this.state.automaticallyRunQuery}
          />
        );
        break;
      case 'logger':
        body = (
          <Logger
            log={this.state.actionLog}
            onSelectLogItem={this.selectLogItem}
            selectedId={this.state.selectedRequestId}
          />
        );
        break;
      default:
        break;
    }

    return (
      <div
        className={classnames(
          'apollo-client-panel',
          { 'in-window': !chrome.devtools },
          chrome.devtools && chrome.devtools.panels.themeName
        )}
      >
        <Sidebar className="tabs" name="nav-tabs">
          <div className="tab logo-tab">
            <Apollo />
          </div>
          <div
            title="GraphiQL console"
            className={classnames('tab', { active: active === 'graphiql' })}
            onClick={() => this.switchPane('graphiql')}
          >
            <GraphQL />
            <div>GraphiQL</div>
          </div>
          <div
            title="Watched queries"
            className={classnames('tab', { active: active === 'queries' })}
            onClick={() => this.switchPane('queries')}
          >
            <Queries />
            <div>Queries</div>
          </div>
          {getMutationDefinition &&
            <div
              title="Watched mutations"
              className={classnames('tab', { active: active === 'mutations' })}
              onClick={() => this.switchPane('mutations')}
            >
              <Queries />
              <div>Mutations</div>
            </div>}
          <div
            title="Apollo client store"
            className={classnames('tab', { active: active === 'store' })}
            onClick={() => this.switchPane('store')}
          >
            <Store />
            <div>Store</div>
          </div>
        </Sidebar>
        {body}
      </div>
    );
  }
}

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

export default class Panel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active: 'graphiql',
      tabData: undefined,
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
      let tabData;

      if (logItem.queries) {
        console.log(logItem.queries);

        let queries = logItem.queries;
        for (var query in queries) {
          const variablesObject = logItem.queries[query].variables;
          logItem.queries[query].variables = JSON.parse(
            JSON.parse(variablesObject)
          );
        }

        tabData = {
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

        tabData = {
          state: { mutations: logItem.mutations }
        };
      }

      if (logItem.inspector) {
        tabData = {
          state: { inspector: logItem.inspector }
        };
      }

      this.setState({
        tabData: tabData
      });
    });

    this.onRun = this.onRun.bind(this);
    this.selectLogItem = this.selectLogItem.bind(this);
  }

  componentWillUnmount() {
    clearTimeout(this._interval);
  }

  selectedApolloLog() {
    if (!this.state.tabData) {
      return {};
    }

    return this.state.tabData;
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
    const { active } = this.state;
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
        body = selectedLog && <Inspector state={selectedLog.state} />;
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

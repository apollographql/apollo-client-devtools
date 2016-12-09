import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import WatchedQueries from './WatchedQueries';
import Explorer from './Explorer';
import Inspector from './Inspector';
import Apollo from './Images/Apollo';
import GraphQL from './Images/GraphQL';
import Store from './Images/Store';
import Queries from './Images/Queries';
import Logger from './Logger';
import { Sidebar } from './Sidebar';

import evalInPage from '../evalInPage';

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
      active: 'queries',
      actionLog: [],
      runQuery: undefined,
      runVariables: undefined,
    };

    this.onRun = this.onRun.bind(this);
  }

  componentDidMount() {
    this.lastActionId = null;
    this.interval = setInterval(() => {
      evalInPage(`
        window.__action_log__
      `, (result) => {
        const newLastActionId = lastActionId(result);
        if (newLastActionId !== this.lastActionId) {
          this.lastActionId = newLastActionId;
          this.setState({
            actionLog: result,
          });
        }
      });
    }, 100);

    evalInPage(`
      (function () {
        let id = 0;
        const logger = (logItem) => {
          // Only log Apollo actions for now
          if (logItem.action.type.split('_')[0] !== 'APOLLO') {
            return;
          }

          id++;

          logItem.id = id;

          window.__action_log__ = window.__action_log__ || [];
          window.__action_log__.push(logItem);

          if (window.__action_log__.length > 10) {
            window.__action_log__.shift();
          }
        }

        window.__APOLLO_CLIENT__.__actionHookForDevTools(logger);
      })()
    `, () => {});
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  lastApolloLog() {
    return this.state.actionLog && this.state.actionLog.length &&
      this.state.actionLog[this.state.actionLog.length - 1];
  }

  onRun(queryString, variables) {
    this.setState({
      active: 'graphiql',
      runQuery: queryString,
      runVariables: variables ? JSON.stringify(variables, null, 2) : '',
    });
  }

  switchPane(pane) {
    this.setState({
      active: pane,
      // Don't leave this stuff around except when actively clicking the run
      // button.
      runQuery: undefined,
      runVariables: undefined,
    });
  }

  render() {
    const { active } = this.state;

    let body;
    switch(active) {
    case 'queries':
      // XXX this won't work in the dev tools
      body = <WatchedQueries state={this.lastApolloLog().state} onRun={this.onRun}/>;
      break;
    case 'store':
      body = <Inspector state={this.lastApolloLog().state} />;
      break;
    case 'graphiql':
      body = <Explorer query={this.state.runQuery} variables={this.state.runVariables}/>;
      break;
    case 'logger':
      body = <Logger log={this.state.actionLog} />;
      break;
    default: break;
    }

    return (
      <div className={classnames('apollo-client-panel', { 'in-window': !chrome.devtools })}>
        <Sidebar className="tabs" name="nav-tabs">
          <div className="tab logo-tab"><Apollo /></div>
          <div
            title="Watched queries"
            className={classnames('tab', { active: active === 'queries' })}
            onClick={() => this.switchPane('queries')}
          ><Queries /><div>Queries</div></div>
          <div
            title="Apollo client store"
            className={classnames('tab', { active: active === 'store' })}
            onClick={() => this.switchPane('store')}
          ><Store /><div>Store</div></div>
          <div
            title="GraphiQL console"
            className={classnames('tab', { active: active === 'graphiql' })}
            onClick={() => this.switchPane('graphiql')}
          ><GraphQL /><div>GraphiQL</div></div>
          <div
            title="Request logger"
            className={classnames('tab', { active: active === 'logger' })}
            onClick={() => this.switchPane('logger')}
          ><GraphQL /><div>Requests</div></div>
        </Sidebar>
        {body}
      </div>
    );
  }
}

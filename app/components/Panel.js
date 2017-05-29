import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
    };
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  selectedApolloLog() {
    const logIsPopulated = this.state.actionLog && this.state.actionLog.length

    if (! logIsPopulated) {
      return null;
    }

    if (this.state.selectedRequestId) {
      const filtered = this.state.actionLog.filter((item) => {
        return item.id === this.state.selectedRequestId;
      });

      return filtered.length && filtered[0];
    }

    return this.state.actionLog[this.state.actionLog.length - 1];
  }

  onRun(queryString, variables) {
    ga('send', 'event', 'WatchedQueries', 'run-in-graphiql');
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

  selectLogItem(id) {
    this.setState({
      selectedRequestId: id,
    });
  }

  render() {
    const { active } = this.state;

    const selectedLog = this.selectedApolloLog();

    let body;
    switch(active) {
    case 'queries':
      // XXX this won't work in the dev tools
      body = selectedLog && <WatchedQueries state={selectedLog.state} onRun={this.onRun}/>;
      break;
    case 'store':
      body = selectedLog && <Inspector />;
      break;
    case 'graphiql':
      body = <Explorer query={this.state.runQuery} variables={this.state.runVariables}/>;
      break;
    case 'logger':
      body = <Logger
        log={this.state.actionLog}
        onSelectLogItem={this.selectLogItem}
        selectedId={this.state.selectedRequestId}
      />;
      break;
    default: break;
    }

    return (
      <div className={classnames('apollo-client-panel', { 'in-window': !chrome.devtools }, chrome.devtools && chrome.devtools.panels.themeName)}>
        <Sidebar className="tabs" name="nav-tabs">
          <div className="tab logo-tab"><Apollo /></div>
          <div
            title="GraphiQL console"
            className={classnames('tab', { active: active === 'graphiql' })}
            onClick={() => this.switchPane('graphiql')}
          ><GraphQL /><div>GraphiQL</div></div>
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
        </Sidebar>
        {body}
      </div>
    );
  }
}

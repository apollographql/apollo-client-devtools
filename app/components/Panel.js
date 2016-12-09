import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import WatchedQueries from './WatchedQueries';
import Explorer from './Explorer';
import Inspector from './Inspector';

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
    };
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
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  lastApolloLog() {
    return this.state.actionLog && this.state.actionLog.length &&
      this.state.actionLog[this.state.actionLog.length - 1];
  }

  render() {
    const { active } = this.state;

    console.log(this.state.actionLog);

    let body;
    switch(active) {
      case 'queries':
        // XXX this won't work in the dev tools
        body = <WatchedQueries state={this.lastApolloLog().state} />;
        break;
      case 'store':
        body = <Inspector state={this.lastApolloLog().state} />;
        break;
      case 'graphiql':
        body = <Explorer />;
        break;
      default: break;
    }

    return (
      <div className={classnames('apollo-client-panel', { 'in-window': !chrome.devtools })}>
        <div className="tabs">
          <div
            className={classnames('tab', { active: active === 'queries' })}
            onClick={() => this.setState({ active: 'queries' })}
          >Queries</div>
          <div
            className={classnames('tab', { active: active === 'store' })}
            onClick={() => this.setState({ active: 'store' })}
          >Store</div>
          <div
            className={classnames('tab', { active: active === 'graphiql' })}
            onClick={() => this.setState({ active: 'graphiql' })}
          >GraphiQL</div>
        </div>
        {body}
      </div>
    );
  }
}

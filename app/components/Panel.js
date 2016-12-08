import React, { Component, PropTypes } from 'react';
import Explorer from './Explorer';
import WatchedQueries from './WatchedQueries';
import classnames from 'classnames';
import '../style/style.less';

export default class Panel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active: 'queries',
    };
  }
  render() {
    const { active } = this.state;

    let body;
    switch(active) {
      case 'queries':
        // XXX this won't work in the dev tools
        body = <WatchedQueries apolloClient={window.__APOLLO_CLIENT__} />;
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
            className={classnames('tab', { active: active === 'graphiql' })}
            onClick={() => this.setState({ active: 'graphiql' })}
          >GraphiQL</div>
        </div>
        {body}
      </div>
    );
  }
}

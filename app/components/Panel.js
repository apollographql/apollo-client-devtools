import React, { Component, PropTypes } from 'react';
import Explorer from './Explorer';
import classnames from 'classnames';
import '../style/style.css';

export default class Panel extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      active: 'graphiql',
    };
  }
  render() {
    const { active } = this.state;

    let body;
    switch(active) {
      case 'queries':
        body = <div>todo</div>;
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

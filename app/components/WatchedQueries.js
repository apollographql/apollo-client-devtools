import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import pickBy from 'lodash/pickBy';
import sortBy from 'lodash/sortBy';
import classnames from 'classnames';
import { getQueryDefinition } from 'apollo-client';
import { parse } from 'graphql-tag/parser';

const queryNameFromQueryString = (queryString) => {
  const doc = parse(queryString);
  const queryDefinition = getQueryDefinition(doc);
  if (queryDefinition.name && queryDefinition.name.value) {
    return queryDefinition.name.value;
  }
  return null;
};

const queryLabel = (queryId, query) => {
  const queryName = queryNameFromQueryString(query.queryString);
  if (queryName === null) {
    return queryId;
  }
  return `${queryId} (${queryName})`;
};

class WatchedQueriesList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedId: null,
    };
  }

  selectId(id) {
    this.setState({ selectedId: id });
  }

  sortedQueryIds() {
    return sortBy(Object.keys(this.props.queries), id => parseInt(id, 10));
  }

  renderSidebarItem(id, query) {
    let className = 'item';
    if (id === this.state.selectedId) {
      className += ' active';
    }
    if (query.loading) {
      className += ' loading';
    }
    return (
      <div key={id} onClick={() => this.selectId(id)}
        className={classnames('item', {
          active: id === this.state.selectedId, loading: query.loading
        })}>
        {queryLabel(id, query)}
      </div>
    );
  }

  render() {
    const { queries } = this.props;
    const { selectedId } = this.state;
    return (
      <div className="watchedQueries body">
        <div className="sidebar">
          {this.sortedQueryIds().map(id => this.renderSidebarItem(id, queries[id]))}
        </div>
        <div className="main">
          {selectedId && queries[selectedId] &&
          <WatchedQuery queryId={selectedId} query={queries[selectedId]} />}
        </div>
      </div>
    );
  }
}

WatchedQueriesList.propTypes = {
  queries: PropTypes.objectOf(PropTypes.shape({
    queryString: PropTypes.string.isRequired,
  })).isRequired,
};

class LabeledShowHide extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { show = true } = props;
    this.state = { show };
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState(({ show }) => ({ show: !show }));
  }
  render() {
    return (
      <div>
        <div>
          <span onClick={this.toggle} className="toggle">
            {this.state.show ? '- ' : '+ '}
          </span>
          {this.props.label}
        </div>
        {this.state.show &&
          <div className="labeled">{this.props.children}</div>}
      </div>
    );
  }
}
LabeledShowHide.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  show: PropTypes.bool,
};

const Variables = ({variables} ) => {
  if (!variables) {
    return null;
  }
  const inner = [];
  Object.keys(variables).sort().forEach((name) => {
    inner.push(<dt key={"dt"+name}>{ name }</dt>);
    inner.push(<dd key={"dd"+name}>{ JSON.stringify(variables[name]) }</dd>);
  });
  return <dl>{inner}</dl>;
};

class WatchedQuery extends React.Component {
  render() {
    const { queryId, query } = this.props;
    const reactComponentDisplayName = query && query.metadata
            && query.metadata.reactComponent
            && query.metadata.reactComponent.displayName;
    return (
      <div className={classnames({loading: query.loading})}>
        <div className="header">
          Query {queryLabel(queryId, query)}
          { query.loading && " [loading]" }
        </div>
        {
          reactComponentDisplayName &&
            <LabeledShowHide label="React component">
              {reactComponentDisplayName}
            </LabeledShowHide>
        }

        <LabeledShowHide label="Query string" show={false}>
          <pre>{query.queryString}</pre>
        </LabeledShowHide>
        <LabeledShowHide label="Variables">
          <Variables variables={query.variables} />
        </LabeledShowHide>
      </div>
    );
  }
}

const WatchedQueriesListWithData = connect(
  (state, props) => {
    const apolloState = props.reduxRootSelector(state);
    // Skip queries that are no longer being watched. (We never actually remove
    // them from Redux!)
    const queries = pickBy(apolloState.queries, query => !query.stopped);
    return { queries };
  }
)(WatchedQueriesList);

const WatchedQueries = ({ apolloClient }) => (
  <WatchedQueriesListWithData
    store={apolloClient.store}
    reduxRootSelector={apolloClient.queryManager.reduxRootSelector}
  />
);

WatchedQueries.propTypes = {
  apolloClient: PropTypes.shape({
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};


export default WatchedQueries;

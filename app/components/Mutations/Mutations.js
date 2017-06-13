import React, { PropTypes } from 'react';
import pickBy from 'lodash/pickBy';
import sortBy from 'lodash/sortBy';
import classnames from 'classnames';
import { getMutationDefinition } from 'apollo-client';
import { parse } from 'graphql-tag/parser';
import { GraphqlCodeBlock } from 'graphql-syntax-highlighter-react';
import { Sidebar } from '../Sidebar';
import Warning from '../Images/Warning';

import './Mutations.less';

const mutationNameFromMutationString = (mutationString) => {
  const doc = parse(mutationString);
  const mutationDefinition = getMutationDefinition(doc);
  if (mutationDefinition.name && mutationDefinition.name.value) {
    return mutationDefinition.name.value;
  }
  return null;
};

const mutationLabel = (mutationId, mutation) => {
  const mutationName = mutationNameFromMutationString(mutation.mutationString);
  if (mutationName === null) {
    return mutationId;
  }
  return `${mutationName}`;
};

class Mutations extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      selectedId: null,
    };
  }

  componentDidMount() {
    if (ga) ga('send', 'pageview', 'Mutations');
  }

  selectId(id) {
    this.setState({ selectedId: id });
  }

  getMutations() {
    return this.props.state ?
      pickBy(this.props.state.mutations, mutation => !mutation.stopped) :
      {};
  }

  sortedMutationIds() {
    const mutations = this.getMutations();
    return sortBy(Object.keys(mutations), id => parseInt(id, 10));
  }

  renderSidebarItem(id, mutation) {
    let className = 'item';
    const hasError = mutation.networkError || (mutation.graphQLErrors && mutation.graphQLErrors.length > 0);
    return (
      <li key={id} onClick={() => this.selectId(id)}
        className={classnames('item', {
          active: id === this.state.selectedId,
          loading: mutation.loading,
          error: hasError
        })}>
        <div className='item-row'>
          <span>{mutationLabel(id, mutation)}</span>
          {hasError && <span className='error-icon'><Warning /></span>}
        </div>
      </li>
    );
  }

  render() {
    const mutations = this.getMutations();

    const { selectedId } = this.state;
    return (
      <div className="mutations body">
        <Sidebar className="sidebar" name="watched-mutations-sidebar">
          <div className="mutations-sidebar-title">Watched mutations</div>
          <ol className="mutation-list">{this.sortedMutationIds().map(id => this.renderSidebarItem(id, mutations[id]))}</ol>
        </Sidebar>
        {selectedId && mutations[selectedId] &&
        <WatchedMutation mutationId={selectedId} mutation={mutations[selectedId]} onRun={this.props.onRun} />}
      </div>
    );
  }
}

Mutations.propTypes = {
  state: PropTypes.object,
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
      <div className={classnames(this.props.className, 'toggled-section')}>
        <span onClick={this.toggle} className="toggle">
          <span className={classnames('triangle', { toggled: !this.state.show })}>&#9662;</span>
          <span className="section-label">{this.props.label}</span>
        </span>
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
    inner.push(
      <tr key={`tr-${name}`}>
        <td key={`dt-${name}`}>{ name }</td>
        <td key={`dd-${name}`}>{ JSON.stringify(variables[name]) }</td>
      </tr>
    );
  });
  return <table><tbody>{inner}</tbody></table>;
};

const GraphQLError = ({error}) => (
  <li className='graphql-error'>
    {
      error.message &&
      <span>{error.message}</span>
    }
  </li>
);
GraphQLError.propTypes = {
  error: PropTypes.shape({
    message: React.PropTypes.string
  }),
};

class WatchedMutation extends React.Component {
  render() {
    const { mutationId, mutation } = this.props;
    const reactComponentDisplayName = mutation && mutation.metadata
            && mutation.metadata.reactComponent
            && mutation.metadata.reactComponent.displayName;
    return (
      <div className={classnames('main', {loading: mutation.loading})}>
        <div className="panel-title">
          { mutationLabel(mutationId, mutation) }
          {reactComponentDisplayName && <span className='component-name'>{`<${reactComponentDisplayName}>`}</span>}
          <span
            className="show-in-graphiql-link"
            onClick={() => this.props.onRun(mutation.mutationString, mutation.variables, 'Mutations', false)}
          >Show in GraphiQL</span>
        <span className={classnames('loading-label', { show: mutation.loading })}>(loading)</span>
        </div>
        {
          mutation.variables &&
          <LabeledShowHide label="Variables">
            <Variables variables={mutation.variables} />
          </LabeledShowHide>
        }
        <LabeledShowHide label="Mutation string" show={false}>
          <GraphqlCodeBlock className="GraphqlCodeBlock" queryBody={mutation.mutationString} />
        </LabeledShowHide>
        {
          mutation.graphQLErrors && mutation.graphQLErrors.length > 0 &&
          <LabeledShowHide label="GraphQL Errors" show={mutation.graphQLErrors && mutation.graphQLErrors.length > 0}>
            <ul>
              {mutation.graphQLErrors.map((error, i) => <GraphQLError key={i} error={error} />)}
            </ul>
          </LabeledShowHide>
        }
        {
          mutation.networkError &&
          <LabeledShowHide label="Network Errors" show={!!mutation.networkError}>
            <pre>There is a network error: {JSON.stringify(mutation.networkError)}</pre>
          </LabeledShowHide>
        }

      </div>
    );
  }
}

export default Mutations;

import PropTypes from "prop-types";
import React from "react";
import pickBy from "lodash.pickby";
import sortBy from "lodash.sortby";
import classnames from "classnames";
import { getOperationName } from "apollo-utilities";
import { parse } from "graphql/language/parser";
import { GraphqlCodeBlock } from "graphql-syntax-highlighter-react";
import { Sidebar } from "../Sidebar";
import Warning from "../Images/Warning";

import "../WatchedQueries/WatchedQueries.less";

const mutationLabel = (mutationId, mutation) => {
  const mutationName = getOperationName(
    parse(mutation.mutationString || mutation.document.loc.source.body),
  );
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
    if (ga) ga("send", "pageview", "Mutations");
  }

  selectId(id) {
    this.setState({ selectedId: id });
  }

  getMutations() {
    return this.props.state
      ? pickBy(this.props.state.mutations, mutation => !mutation.stopped)
      : {};
  }

  sortedMutationIds() {
    const mutations = this.getMutations();
    return sortBy(Object.keys(mutations), id => parseInt(id, 10));
  }

  renderSidebarItem(id, mutation) {
    let className = "item";
    const hasError =
      mutation.networkError ||
      (mutation.graphQLErrors && mutation.graphQLErrors.length > 0);
    return (
      <li
        key={id}
        onClick={() => this.selectId(id)}
        className={classnames("item", {
          active: id === this.state.selectedId,
          loading: mutation.loading,
          error: hasError,
        })}
      >
        <div className="item-row">
          <h4>{mutationLabel(id, mutation)}</h4>
          {hasError && (
            <span className="error-icon">
              <Warning />
            </span>
          )}
        </div>
      </li>
    );
  }

  render() {
    const mutations = this.getMutations();

    const { selectedId } = this.state;
    return (
      <div className="watchedQueries body">
        <Sidebar className="sidebar" name="watched-mutations-sidebar">
          <h4 className="queries-sidebar-title">Mutation log</h4>
          <ol className="query-list">
            {this.sortedMutationIds().map(id =>
              this.renderSidebarItem(id, mutations[id]),
            )}
          </ol>
        </Sidebar>
        {selectedId &&
          mutations[selectedId] && (
            <WatchedMutation
              mutationId={selectedId}
              mutation={mutations[selectedId]}
              onRun={this.props.onRun}
            />
          )}
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
      <div className={classnames(this.props.className, "toggled-section")}>
        <span onClick={this.toggle} className="toggle">
          <span
            className={classnames("triangle", { toggled: !this.state.show })}
          >
            &#9662;
          </span>
          <span className="section-label">{this.props.label}</span>
        </span>
        {this.state.show && (
          <div className="labeled">{this.props.children}</div>
        )}
      </div>
    );
  }
}
LabeledShowHide.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
  show: PropTypes.bool,
};

const Variables = ({ variables }) => {
  if (!variables) {
    return null;
  }
  const inner = [];
  Object.keys(variables)
    .sort()
    .forEach(name => {
      inner.push(
        <tr key={`tr-${name}`}>
          <td key={`dt-${name}`}>{name}</td>
          <td key={`dd-${name}`}>{JSON.stringify(variables[name])}</td>
        </tr>,
      );
    });
  return (
    <table>
      <tbody>{inner}</tbody>
    </table>
  );
};

const GraphQLError = ({ error }) => (
  <li className="graphql-error">
    {error.message && <span>{error.message}</span>}
  </li>
);
GraphQLError.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

class WatchedMutation extends React.Component {
  render() {
    const { mutationId, mutation } = this.props;
    const reactComponentDisplayName =
      mutation &&
      mutation.metadata &&
      mutation.metadata.reactComponent &&
      mutation.metadata.reactComponent.displayName;
    const componentDisplayName =
      mutation &&
      mutation.metadata &&
      mutation.metadata.component &&
      mutation.metadata.component.displayName;
    const displayName = componentDisplayName || reactComponentDisplayName;

    const mutationString =
      mutation.mutationString || mutation.document.loc.source.body;

    return (
      <div className={classnames("main", { loading: mutation.loading })}>
        <div className="panel-title">
          {mutationLabel(mutationId, mutation)}
          {displayName && (
            <span className="component-name">{`<${displayName}>`}</span>
          )}
          <span
            className="run-in-graphiql-link"
            onClick={() =>
              this.props.onRun(
                mutationString,
                mutation.variables,
                "Mutations",
                false,
              )
            }
          >
            Run in GraphiQL
          </span>
          <span
            className={classnames("loading-label", { show: mutation.loading })}
          >
            (loading)
          </span>
        </div>
        {mutation.variables && (
          <LabeledShowHide label="Variables">
            <Variables variables={mutation.variables} />
          </LabeledShowHide>
        )}
        <LabeledShowHide label="Mutation string" show={false}>
          <GraphqlCodeBlock
            className="GraphqlCodeBlock"
            queryBody={mutationString}
          />
        </LabeledShowHide>
        {mutation.graphQLErrors &&
          mutation.graphQLErrors.length > 0 && (
            <LabeledShowHide
              label="GraphQL Errors"
              show={mutation.graphQLErrors && mutation.graphQLErrors.length > 0}
            >
              <ul>
                {mutation.graphQLErrors.map((error, i) => (
                  <GraphQLError key={i} error={error} />
                ))}
              </ul>
            </LabeledShowHide>
          )}
        {mutation.networkError && (
          <LabeledShowHide
            label="Network Errors"
            show={!!mutation.networkError}
          >
            <pre>
              There is a network error: {JSON.stringify(mutation.networkError)}
            </pre>
          </LabeledShowHide>
        )}
      </div>
    );
  }
}

export default Mutations;

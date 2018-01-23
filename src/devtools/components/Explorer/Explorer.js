import PropTypes from "prop-types";
import React, { Component } from "react";
import GraphiQL from "graphiql";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import { Observable, execute, ApolloLink } from "apollo-link";

import { withBridge } from "../bridge";

import "./graphiql.less";
import "./graphiql-overrides.less";

let id = 0;

export class Explorer extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      noFetch: false,
      query: this.props.query,
      variables: this.props.variables,
    };

    this.link = new ApolloLink(
      operation =>
        new Observable(obs => {
          const key = operation.toKey();
          const next = result => obs.next(JSON.parse(result));
          const error = err => obs.error(JSON.parse(err));
          const complete = () => obs.complete();
          const { query, operationName, variables } = operation;

          // subscribe to this operation's information
          this.props.bridge.on(`link:next:${key}`, next);
          this.props.bridge.on(`link:error:${key}`, error);
          this.props.bridge.on(`link:complete:${key}`, complete);

          const payload = JSON.stringify({
            query: print(query),
            operationName,
            variables,
            key,
          });
          // fire the event for the link on the other side of the wall
          this.props.bridge.send("link:operation", payload);

          return () => {
            this.props.bridge.removeListener(`link:next:${key}`, next);
            this.props.bridge.removeListener(`link:error:${key}`, error);
            this.props.bridge.removeListener(`link:complete:${key}`, complete);
          };
        })
    );
  }

  componentDidMount() {
    if (ga) ga("send", "pageview", "GraphiQL");
    if (this.props.query) {
      if (this.props.automaticallyRunQuery) {
        this.graphiql.handleRunQuery();
      }
    }
  }

  clearDefaultQueryState() {
    this.setState({ query: undefined, variables: undefined });
  }

  fetcher = ({ query, variables = {} }) =>
    execute(this.link, { query: parse(query), variables });

  render() {
    const { noFetch } = this.state;
    const graphiql = (
      <GraphiQL
        fetcher={this.fetcher}
        query={this.state.query}
        onEditQuery={() => {
          this.clearDefaultQueryState();
        }}
        onEditVariables={() => {
          this.clearDefaultQueryState();
        }}
        variables={this.state.variables}
        ref={r => {
          this.graphiql = r;
        }}
      >
        <GraphiQL.Toolbar>
          <label>
            <input
              type="checkbox"
              checked={noFetch}
              onChange={() => {
                this.setState({
                  noFetch: !noFetch,
                  query: undefined,
                  variables: undefined,
                });
              }}
            />
            Load from cache
          </label>
        </GraphiQL.Toolbar>
      </GraphiQL>
    );

    return <div className="body">{graphiql}</div>;
  }
}

export default withBridge(Explorer);

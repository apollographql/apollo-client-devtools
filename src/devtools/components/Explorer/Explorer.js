import PropTypes from "prop-types";
import React, { Component } from "react";
import GraphiQL from "graphiql";
import uniqBy from "lodash.uniqby";
import flatten from "lodash.flattendeep";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import {
  printIntrospectionSchema,
  buildSchema,
  introspectionQuery,
  printSchema,
  buildClientSchema,
} from "graphql/utilities";
import { mergeSchemas } from "graphql-tools";
import { execute as graphql } from "graphql/execution";

import { Observable, execute, ApolloLink } from "apollo-link";

import { withBridge } from "../bridge";

import "./graphiql.less";
import "./graphiql-overrides.less";

let id = 0;

const introAST = parse(introspectionQuery);
const intro = introspectionQuery.replace(/\s/g, "");

export const createBridgeLink = bridge =>
  new ApolloLink(
    operation =>
      new Observable(obs => {
        const key = operation.toKey();
        const { query, operationName, variables } = operation;
        const complete = () => obs.complete();
        const error = err => obs.error(JSON.parse(err));

        const next = _result => {
          const result = JSON.parse(_result);

          // we use gql here because it caches ast transforms
          if (
            !result.extensions ||
            !result.extensions.schemas ||
            print(query).replace(/\s/g, "") !== intro
          ) {
            // clean up some data
            if (result.extensions) {
              delete result.extensions.schemas;
              if (Object.keys(result.extensions).length === 0) {
                delete result.extensions;
              }
            }
            obs.next(result);
            return;
          }

          const { schemas } = result.extensions;
          // merge schemas together
          let remoteSchema = buildClientSchema(result.data);

          // add add-hoc client only directives
          // XXX replace this with better directives => types function
          // XXX this is a bottleneck but only happens once
          let remoteSchemaString = printSchema(remoteSchema);
          const directivesOnly = schemas
            .filter(x => !x.definition)
            .map(x => x.directives);
          remoteSchemaString =
            remoteSchemaString + ` ${directivesOnly.join("\n")}`;
          remoteSchema = buildSchema(remoteSchemaString);

          const definitions = schemas.filter(x => !!x.definition);
          const built = definitions.map(({ definition, directives = "" }) =>
            buildSchema(`${directives} ${definition}`),
          );
          const directives = built
            .map(({ _directives }) => _directives)
            .concat(remoteSchema._directives);
          const merged = mergeSchemas({
            schemas: [remoteSchema].concat(built),
          });

          merged._directives = uniqBy(
            flatten(merged._directives.concat(directives)),
            "name",
          );
          try {
            const newResult = graphql(merged, introAST);
            obs.next(newResult);
          } catch (e) {
            obs.error(e.stack);
          }
        };

        // subscribe to this operation's information
        bridge.on(`link:next:${key}`, next);
        bridge.on(`link:error:${key}`, error);
        bridge.on(`link:complete:${key}`, complete);

        const payload = JSON.stringify({
          query: print(query),
          operationName,
          variables,
          key,
          fetchPolicy: operation.getContext().noFetch
            ? "cache-only"
            : "no-cache",
        });
        // fire the event for the link on the other side of the wall
        bridge.send("link:operation", payload);

        return () => {
          bridge.removeListener(`link:next:${key}`, next);
          bridge.removeListener(`link:error:${key}`, error);
          bridge.removeListener(`link:complete:${key}`, complete);
        };
      }),
  );

export class Explorer extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      noFetch: false,
      query: this.props.query,
      variables: this.props.variables,
    };

    this.link = createBridgeLink(this.props.bridge);
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
    execute(this.link, {
      query: parse(query),
      variables,
      context: { noFetch: this.state.noFetch },
    });

  handleClickPrettifyButton = event => {
    const editor = this.graphiql.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };

  render() {
    const { noFetch } = this.state;
    const { theme } = this.props;
    const graphiql = (
      <GraphiQL
        fetcher={this.fetcher}
        query={this.state.query}
        editorTheme={theme === "dark" ? "dracula" : "graphiql"}
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
          <GraphiQL.Button
            onClick={this.handleClickPrettifyButton}
            label="Prettify"
          />
          <label>
            <input
              type="checkbox"
              checked={noFetch}
              style={{ verticalAlign: "middle" }}
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

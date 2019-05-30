import React, { Component } from "react";
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import uniqBy from "lodash.uniqby";
import flatten from "lodash.flattendeep";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import {
  getIntrospectionQuery,
  buildSchema,
  introspectionQuery,
  printSchema,
  buildClientSchema,
  extendSchema,
} from "graphql/utilities";
import { mergeSchemas } from "graphql-tools";
import { execute as graphql } from "graphql/execution";
import { StorageContext } from "../../context/StorageContext";
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
          const directivesOnly = schemas
            .filter(x => !x.definition)
            .map(x => x.directives);
          const definitions = schemas
            .filter(x => !!x.definition)
            // Filter out @client directives because they'll be handled
            // separately below.
            .filter(
              definition =>
                definition.directives !== "directive @client on FIELD",
            );
          const built = definitions.map(({ definition, directives = "" }) =>
            buildSchema(`${directives} ${definition}`),
          );
          let directives = built.map(({ _directives }) => _directives);

          let mergedSchema;

          if (result.data && Object.keys(result.data).length !== 0) {
            // local and remote app

            // merge schemas together
            let remoteSchema = buildClientSchema(result.data);

            // add add-hoc client only directives
            // XXX replace this with better directives => types function
            // XXX this is a bottleneck but only happens once
            let remoteSchemaString = printSchema(remoteSchema);

            remoteSchemaString =
              remoteSchemaString + ` ${directivesOnly.join("\n")}`;
            remoteSchema = buildSchema(remoteSchemaString);

            directives = directives.concat(remoteSchema._directives);

            mergedSchema = mergeSchemas({
              schemas: [remoteSchema].concat(built),
            });
          } else {
            mergedSchema = mergeSchemas({ schemas: built });
          }

          // Incorporate client schemas

          const clientSchemas = schemas.filter(
            ({ directives }) => directives === "directive @client on FIELD",
          );

          if (clientSchemas.length > 0) {
            // Add all the directives for all the client schemas! This will produce
            // duplicates; that's ok because duplicates are filtered below.
            directives = directives.concat(
              ...clientSchemas.map(clientSchema =>
                buildSchema(clientSchema.directives).getDirectives(),
              ),
            );

            // Merge all of the client schema definitions into the merged schema.
            clientSchemas.forEach(({ definition }) => {
              mergedSchema = extendSchema(mergedSchema, parse(definition));
            });
          }

          // Remove directives that share the name (aka remove duplicates)
          mergedSchema._directives = uniqBy(
            flatten(mergedSchema._directives.concat(directives)),
            "name",
          );
          try {
            const newResult = graphql(mergedSchema, introAST);
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
  static contextType = StorageContext;

  constructor(props, context) {
    super(props, context);

    this.state = {
      noFetch: false,
      query: this.props.query,
      variables: this.props.variables,
      schema: null,
    };

    this.link = createBridgeLink(this.props.bridge);
  }

  fetcher = ({ query, variables = {} }) => {
    const result = execute(this.link, {
      query: parse(query),
      variables,
      context: { noFetch: this.state.noFetch },
    });

    return result;
  };

  componentDidMount() {
    this.fetcher({
      query: getIntrospectionQuery(),
    }).forEach(result => {
      this.setState(oldState => {
        return {
          schema: buildClientSchema(result.data),
          query:
            oldState.query || this.context.storage.getItem("graphiql:query"),
        };
      });
    });

    if (this.props.query) {
      if (this.props.automaticallyRunQuery) {
        this.graphiql.handleRunQuery();
      }
    }
  }

  clearDefaultQueryState(query) {
    this.setState({ query: query, variables: undefined });
  }

  handleClickPrettifyButton = event => {
    const editor = this.graphiql.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };

  handleToggleExplorer = () => {
    this.setState({ explorerIsOpen: !this.state.explorerIsOpen });
  };

  render() {
    const { noFetch, query, schema } = this.state;

    const { theme } = this.props;

    const graphiql = (
      <div className="graphiql-container">
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={query => this.clearDefaultQueryState(query)}
          explorerIsOpen={this.state.explorerIsOpen}
          onToggleExplorer={this.handleToggleExplorer}
        />
        <GraphiQL
          fetcher={this.fetcher}
          query={query}
          schema={schema}
          editorTheme={theme === "dark" ? "dracula" : "graphiql"}
          onEditQuery={query => {
            this.clearDefaultQueryState(query);
          }}
          onEditVariables={() => {
            this.clearDefaultQueryState();
          }}
          storage={this.context.storage}
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
            <GraphiQL.Button
              onClick={this.handleToggleExplorer}
              label="Explorer"
              title="Toggle Explorer"
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
      </div>
    );

    return <div className="body">{graphiql}</div>;
  }
}

export default withBridge(Explorer);

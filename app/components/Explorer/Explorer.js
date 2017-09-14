import React, { Component, PropTypes } from 'react';
import GraphiQL from 'graphiql';
import { parse } from 'graphql';
import evalInPage from '../../evalInPage.js';

import './graphiql.less';
import './graphiql-overrides.less';

let id = 0;
const createPromise = code => {
  return new Promise((resolve, reject) => {
    const currId = id;
    id++;

    const promiseCode = `
    (function() {
      window.__chromePromises = window.__chromePromises || {};
      var p = (${code})

      p.then(function(r) {
        window.__chromePromises[${currId}] = { result: r };
      }).catch(function (e) {
        window.__chromePromises[${currId}] = { error: e };
      });
    })()
    `;

    evalInPage(promiseCode, (result, isException) => {
      if (isException) console.warn('isException1', isException);
    });

    const pollCode = `
      (function () {
        var result = window.__chromePromises[${currId}];
        if (result) {
          delete window.__chromePromises[${currId}];
        }
        return result;
      })()
    `;

    const poll = () => {
      setTimeout(() => {
        evalInPage(pollCode, (result, isException) => {
          if (!result) {
            poll();
          } else if (result.result) {
            resolve(result.result);
          } else {
            reject(result.error);
          }
        });
      }, 100);
    };
    poll();
  });
};

export default class Explorer extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      noFetch: false,
      query: this.props.query,
      variables: this.props.variables
    };

    try {
      evalInPage(
        `
        window.__APOLLO_CLIENT__.makeGraphiqlQuery = (payload, noFetch) => {
          if (noFetch) {
            return window.__APOLLO_CLIENT__.query({
              query: payload.query,
              variables: payload.variables,
              fetchPolicy: 'cache-only',
            }).catch(e => ({
              errors: e.graphQLErrors,
            }));
          }
          if (window.__APOLLO_CLIENT__.networkInterface) {
            return window.__APOLLO_CLIENT__.networkInterface.query(payload);
          }
          var completed;
          return new Promise(function(resolve, reject) {
            return window.__APOLLO_CLIENT__.link.request(payload).subscribe({
              next: data => {
                if (completed) {
                   console.warn(
                     'Promise Wrapper does not support multiple results from Observable',
                   );
                 } else {
                   completed = true;
                   resolve(data);
                }
              },
              error: reject,
            });
          });
        };
        `,
        (result, isException) => {}
      );
    } catch (e) {
      console.warn(e);
    }

    this.graphQLFetcher = graphQLParams => {
      const { noFetch } = this.state;

      return createPromise(
        'window.__APOLLO_CLIENT__.makeGraphiqlQuery(' +
          JSON.stringify({
            operationName: graphQLParams.operationName,
            query: parse(graphQLParams.query),
            variables: graphQLParams.variables
          }) +
          ', ' +
          noFetch +
          ')'
      );
    };
  }

  componentDidMount() {
    if (ga) ga('send', 'pageview', 'GraphiQL');
    if (this.props.query) {
      if (this.props.automaticallyRunQuery) {
        this.graphiql.handleRunQuery();
      }
    }
  }

  clearDefaultQueryState() {
    this.setState({ query: undefined, variables: undefined });
  }

  render() {
    const { noFetch } = this.state;
    const graphiql = (
      <GraphiQL
        fetcher={this.graphQLFetcher}
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
                  variables: undefined
                });
              }}
            />
            Load from cache
          </label>
        </GraphiQL.Toolbar>
      </GraphiQL>
    );

    return (
      <div className="body">
        {graphiql}
      </div>
    );
  }
}

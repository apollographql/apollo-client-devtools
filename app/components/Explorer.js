import React, { Component, PropTypes } from 'react';
import GraphiQL from 'graphiql';
import { parse } from 'graphql';
import '../style/graphiql.less';

let id = 0;
const createPromise = (code) => {
  console.log('making new promise for: \n', code);
  return new Promise((resolve, reject) => {
    const currId = id; id ++;

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

    chrome.devtools.inspectedWindow.eval(
      promiseCode,
      (result, isException) => {
        if (isException) console.warn('isException1', isException);
      }
    );

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
        chrome.devtools.inspectedWindow.eval(
          pollCode,
          (result, isException) => {
            if (!result) {
              poll();
            } else if (result.result) {
              resolve(result.result);
            } else {
              reject(result.error);
            }
          }
        );
      }, 100)
    };
    poll();
  });
};

try {
  chrome.devtools.inspectedWindow.eval(
    `window.__APOLLO_CLIENT__.makeGraphiqlQuery = (payload, noFetch) => {
      console.log('called makeGraphiqlQuery');
      if (noFetch) {
        console.log("not fetching");
        return window.__APOLLO_CLIENT__.query({
          query: payload.query,
          variables: payload.variables,
          nofetch: true,
        }).catch(e => ({
          errors: e.graphQLErrors,
        }));
      }
      console.log('fetching');
      return window.__APOLLO_CLIENT__.networkInterface.query(payload);
    };
    `, (result, isException) => {}
  );
} catch(e) {
  console.warn(e);
}

export default class Explorer extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      noFetch: false,
    };

    this.graphQLFetcher = (graphQLParams) => {
      const { noFetch } = this.state;

      if (chrome && chrome.devtools) { // in chrome extension
        return createPromise(
          "window.__APOLLO_CLIENT__.makeGraphiqlQuery(" + JSON.stringify({
            query: parse(graphQLParams.query),
            variables: graphQLParams.variables,
          }) + ", " + noFetch + ")"
        );
      } else { // in extension development environment
        if (noFetch) {
          return window.__APOLLO_CLIENT__.query({
            query: parse(graphQLParams.query),
            variables: graphQLParams.variables,
            noFetch: true,
          });
        } else {
          return window.__APOLLO_CLIENT__.networkInterface.query({
            query: parse(graphQLParams.query),
            variables: graphQLParams.variables,
          })
        }
      }
    };
  }
  render() {
    const { noFetch } = this.state;
    return (
      <div className="body">
        <GraphiQL fetcher={this.graphQLFetcher}>
          <GraphiQL.Logo>
            Custom Logo
          </GraphiQL.Logo>
          <GraphiQL.Toolbar>
            <button
              name="NoFetchButton"
              className={`${noFetch ? 'active ' : ''}no-fetch-button`}
              onClick={() => { this.setState({ noFetch: !noFetch }); }}
            >Local</button>
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}

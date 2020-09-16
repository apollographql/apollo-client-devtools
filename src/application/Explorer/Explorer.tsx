import React, { useRef, useState, useEffect } from "react";
import GraphiQL from "graphiql";
import { Observable , useQuery, gql } from "@apollo/client";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import { graphiQLQuery, ColorThemes } from '../index';
import { sendGraphiQLRequest, receiveGraphiQLResponses, listenForResponse } from './graphiQLRelay';

import "../../../node_modules/graphiql/graphiql.css";

// TODO: Run IntrospectionQuery outside GraphiQL component 
// TODO: Integrate GraphiQL Explorer
// TODO: "Run in GraphiQL"

const GET_EXPLORER_DATA = gql`
  query GetExplorerData {
    colorTheme @client
    graphiQLQuery @client
  }
`;

enum FetchPolicies {
  NoCache = 'no-cache',
  CacheOnly = 'cache-only'
}

type FetchPolicy = FetchPolicies;

export const Explorer = () => {
  const graphiQLRef = useRef<any>(null);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(FetchPolicies.NoCache);

  const { data, loading, error } = useQuery(GET_EXPLORER_DATA);
  // Subscribe to GraphiQL data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveGraphiQLResponses());

  const handleClickPrettifyButton = () => {
    const editor = graphiQLRef.current?.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };

  if (loading || !data || error) {
    // TODO: Proper loading / error states
    return null;
  }

  return (
    <div className="graphiql-container">
      <GraphiQL
        ref={graphiQLRef}
        fetcher={({ query, operationName, variables }) => new Observable(observer => {
          const payload = JSON.stringify({
            query,
            operationName,
            variables,
            fetchPolicy: operationName === 'IntrospectionQuery' ? FetchPolicies.NoCache : queryCache
          });
          sendGraphiQLRequest(payload);
          listenForResponse(operationName, payload => {
            observer.next(payload);
            observer.complete();
          });
        }) as any}
        query={data.graphiQLQuery}
        editorTheme={data.colorTheme === ColorThemes.Dark ? 'dracula' : 'graphiql'}
        onEditQuery={query => {
          graphiQLQuery(query);
        }}
      >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              label="Prettify"
              title="Prettify"
              onClick={handleClickPrettifyButton}
            />
            <label>
              <input
                type="checkbox"
                checked={queryCache === FetchPolicies.CacheOnly}
                onChange={() => setQueryCache(queryCache === FetchPolicies.CacheOnly ? FetchPolicies.NoCache : FetchPolicies.CacheOnly)}
              />
              Load from cache
            </label>
          </GraphiQL.Toolbar>
        </GraphiQL>
    </div>
  );
};

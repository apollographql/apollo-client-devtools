import React, { useRef, useState, useEffect } from "react";
import GraphiQL from "graphiql";
import { Observable } from "@apollo/client";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import { sendGraphiQLRequest, receiveGraphiQLResponses, listenForResponse, graphiQL } from './graphiQLRelay';

import "../../../node_modules/graphiql/graphiql.css";

// Get introspection query
// "Run in GraphiQL"
// "Load from cache"
// Relay
enum FetchPolicies {
  NoCache = 'no-cache',
  CacheOnly = 'cache-only'
}

type FetchPolicy = FetchPolicies;

export const Explorer = () => {
  const graphiQLRef = useRef<any>(null);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(FetchPolicies.NoCache);

  // Subscribe to GraphiQL data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveGraphiQLResponses());

  const handleClickPrettifyButton = () => {
    const editor = graphiQLRef.current?.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };

  return (
    <div className="graphiql-container">
      <GraphiQL
        ref={graphiQLRef}
        fetcher={({ query, operationName, variables }) => new Observable(observer => {
          const payload = JSON.stringify({
            query,
            operationName,
            variables,
            fetchPolicy: queryCache
          });
          sendGraphiQLRequest(payload);
          return listenForResponse(operationName, observer);
        }) as any}
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

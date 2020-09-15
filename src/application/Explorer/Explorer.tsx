import React, { useRef, useState, useEffect } from "react";
import GraphiQL from "graphiql";
import { Observable } from "@apollo/client";
import { sendGraphiQLRequest, receiveGraphiQLResponses, listenForResponse } from './graphiQLRelay';

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
  const graphiQLRef = useRef(null);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(FetchPolicies.NoCache);

  // Subscribe to GraphiQL data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveGraphiQLResponses());

  return (
    <div className="graphiql-container">
      <GraphiQL
        ref={graphiQLRef}
        fetcher={({ query, operationName, variables }) => new Observable(observer => {
          console.log('WE GOTTA QUERY HERE', query);
          const payload = JSON.stringify({
            query,
            operationName,
            variables,
            fetchPolicy: queryCache
          });
          sendGraphiQLRequest(payload);
          const removeListener = listenForResponse(operationName, observer);

          return removeListener;
        }) as any}
      >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              label="Prettify"
              title="Prettify"
              onClick={() => {
                // TODO: Handle prettify
              }}
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

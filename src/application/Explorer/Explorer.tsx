import React, { useRef, useState, useEffect } from "react";
import GraphiQL from "graphiql";
import { Observable, gql } from "@apollo/client";
import { sendGraphiQLRequest, receiveGraphiQLResponses, listenForResponse } from './graphiQLRelay';

import "../../../node_modules/graphiql/graphiql.css";

// Get introspection query
// "Run in GraphiQL"
// "Load from cache"
// Relay
export const Explorer = () => {
  const graphiQLRef = useRef(null);
  const [queryCache, setQueryCache] = useState<boolean>(false);

  // Subscribe to GraphiQL data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveGraphiQLResponses());

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
              ? "cache-only"
              : "no-cache",
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
                checked={queryCache}
                onChange={() => setQueryCache(!queryCache)}
              />
              Load from cache
            </label>
          </GraphiQL.Toolbar>
        </GraphiQL>
    </div>
  );
};

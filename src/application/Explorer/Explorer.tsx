import React, { useRef, useState, useEffect } from "react";
import GraphiQL from "graphiql";
import {
  getIntrospectionQuery,
} from "graphql/utilities";
import { Observable, execute, ApolloLink } from "@apollo/client";
import { sendGraphiQLRequest, receiveGraphiQLResponses } from './graphiQLRelay';

import "../../../node_modules/graphiql/graphiql.css";

// Get introspection query
// "Run in GraphiQL"
// "Load from cache"
// Relay
type Operation = {
  operationName: string,
  query: string,
  variables?: any,
}

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
        fetcher={(operation: Operation) => new Observable(observer => {
          // const removeListener = Relay.listen()
          sendGraphiQLRequest(operation);
          observer.complete();

          return () => {
            // removeListener();
          };
        }) as any}
      >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              label="Prettify"
              title="Prettify"
              onClick={this.handleClickPrettifyButton}
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

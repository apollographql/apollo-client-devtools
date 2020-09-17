import React, { useRef, useState, useEffect } from "react";
import GraphiQL from "graphiql";
import { Observable , useQuery, gql } from "@apollo/client";
import { getIntrospectionQuery, buildClientSchema } from "graphql/utilities";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import GraphiQLExplorer from "graphiql-explorer";
import { graphiQLQuery, ColorThemes } from '../index';
import { sendGraphiQLRequest, receiveGraphiQLResponses, listenForResponse } from './graphiQLRelay';

import "../../../node_modules/graphiql/graphiql.css";

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
  const graphiQLRef = useRef<any>();
  const [schema, setSchema] = useState();
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(FetchPolicies.NoCache);

  const { data, loading, error } = useQuery(GET_EXPLORER_DATA);

  const executeOperation = ({ query, operationName, variables, fetchPolicy = queryCache }) => new Observable(observer => {
    const payload = JSON.stringify({
      query,
      operationName,
      variables,
      fetchPolicy,
    });
    sendGraphiQLRequest(payload);
    listenForResponse(operationName, payload => {
      observer.next(payload);
      observer.complete();
    });
  }) as any;

  // Subscribe to GraphiQL data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveGraphiQLResponses());

  useEffect(() => {
    const observer = executeOperation({ 
      query: getIntrospectionQuery(), 
      operationName: 'IntrospectionQuery', 
      variables: null,
      fetchPolicy: FetchPolicies.NoCache, 
    });

    observer.subscribe(response => {
      setSchema(buildClientSchema(response.data) as any);
    });
  }, []);

  const handleClickPrettifyButton = () => {
    const editor = graphiQLRef.current?.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };

  const handleToggleExplorer = () => setIsExplorerOpen(!isExplorerOpen);

  if (loading || !data || error) {
    // TODO: Proper loading / error states
    return null;
  }

  return (
    <div className="graphiql-container">
      <GraphiQLExplorer
        schema={schema}
        query={data.graphiQLQuery}
        onEdit={query => graphiQLQuery(query)}
        explorerIsOpen={isExplorerOpen}
        onToggleExplorer={handleToggleExplorer}
      />
      <GraphiQL
        ref={graphiQLRef}
        fetcher={executeOperation}
        schema={schema}
        query={data.graphiQLQuery}
        editorTheme={data.colorTheme === ColorThemes.Dark ? 'dracula' : 'graphiql'}
        onEditQuery={query => graphiQLQuery(query)}
      >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              label="Prettify"
              title="Prettify"
              onClick={handleClickPrettifyButton}
            />
            <GraphiQL.Button
              label="Explorer"
              title="Toggle Explorer"
              onClick={handleToggleExplorer}
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

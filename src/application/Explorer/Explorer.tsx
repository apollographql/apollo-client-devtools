import React, { useRef, useState, useEffect } from "react";
import GraphiQL from "graphiql";
import { Observable, useQuery, useReactiveVar, gql, FetchResult } from "@apollo/client";
import type { GraphQLSchema, IntrospectionQuery } from "graphql";
import { getIntrospectionQuery, buildClientSchema } from "graphql/utilities";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import GraphiQLExplorer from "graphiql-explorer";
import { Button } from "@apollo/space-kit/Button";
import { graphiQLQuery, ColorTheme, colorTheme } from '../index';
import { sendGraphiQLRequest, receiveGraphiQLResponses, listenForResponse } from './graphiQLRelay';
import { FullWidthLayout } from '../Layouts/FullWidthLayout';

import "../../../node_modules/graphiql/graphiql.css";

const GET_EXPLORER_DATA = gql`
  query GetExplorerData {
    graphiQLQuery @client
  }
`;

enum FetchPolicy {
  NoCache = 'no-cache',
  CacheOnly = 'cache-only'
}

export const Explorer = ({ navigationProps }) => {
  const graphiQLRef = useRef<GraphiQL>(null);
  const [schema, setSchema] = useState<GraphQLSchema>();
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(FetchPolicy.NoCache);

  const { data, loading, error } = useQuery(GET_EXPLORER_DATA);
  const theme = useReactiveVar(colorTheme);

  const executeOperation = ({ query, operationName, variables, fetchPolicy = queryCache }) => new Observable<FetchResult>(observer => {
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
  });

  // Subscribe to GraphiQL data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveGraphiQLResponses());

  useEffect(() => {
    const observer = executeOperation({ 
      query: getIntrospectionQuery(), 
      operationName: 'IntrospectionQuery', 
      variables: null,
      fetchPolicy: FetchPolicy.NoCache, 
    });

    observer.subscribe(response => {
      setSchema(buildClientSchema(response.data as IntrospectionQuery));
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
    <FullWidthLayout navigationProps={navigationProps}>
      <FullWidthLayout.Header>
        <Button
          title="Prettify"
          onClick={handleClickPrettifyButton}
        >
          Prettify
        </Button>
        <Button
          title="Toggle Explorer"
          onClick={handleToggleExplorer}
        >
          Explorer
        </Button>
        <label>
          <input
            type="checkbox"
            name="loadFromCache"
            checked={queryCache === FetchPolicy.CacheOnly}
            onChange={() => setQueryCache(queryCache === FetchPolicy.CacheOnly ? FetchPolicy.NoCache : FetchPolicy.CacheOnly)}
          />
          Load from cache
        </label>
      </FullWidthLayout.Header>
      <FullWidthLayout.Main>
        <GraphiQLExplorer
          schema={schema}
          query={data.graphiQLQuery}
          onEdit={query => graphiQLQuery(query)}
          explorerIsOpen={isExplorerOpen}
          onToggleExplorer={handleToggleExplorer}
        />
        <GraphiQL
          ref={graphiQLRef}
          fetcher={executeOperation as any}
          schema={schema}
          query={data.graphiQLQuery}
          editorTheme={theme === ColorTheme.Dark ? 'dracula' : 'graphiql'}
          onEditQuery={query => graphiQLQuery(query)}
        >
          <GraphiQL.Toolbar />
        </GraphiQL>
      </FullWidthLayout.Main>
    </FullWidthLayout>
  );
};

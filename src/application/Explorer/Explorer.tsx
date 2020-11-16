/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { useRef, useState, useEffect, Fragment } from "react";
// @ts-ignore
import GraphiQL from "@forked/graphiql";
import { Observable, makeVar, useReactiveVar, FetchResult } from "@apollo/client";
import type { GraphQLSchema, IntrospectionQuery } from "graphql";
import { getIntrospectionQuery, buildClientSchema } from "graphql/utilities";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import GraphiQLExplorer from "graphiql-explorer";
import { Button } from "@apollo/space-kit/Button";
import { colorTheme } from '../index';
import { ColorTheme } from '../theme';
import { sendGraphiQLRequest, receiveGraphiQLResponses, listenForResponse } from './graphiQLRelay';
import { FullWidthLayout } from '../Layouts/FullWidthLayout';

import "@forked/graphiql-css";

enum FetchPolicy {
  NoCache = 'no-cache',
  CacheOnly = 'cache-only'
}

export const graphiQLQuery = makeVar<string>('');
export const graphiQLSchema = makeVar<GraphQLSchema | undefined>(undefined);

export const resetGraphiQLVars = () => {
  graphiQLQuery('');
  graphiQLSchema(undefined);
};

const headerStyles = css`
  display: flex;
  align-items: center;
  padding: 0 ${rem(16)};
  border-bottom: ${rem(1)} solid ${colors.silver.darker};
`;

const buttonStyles = css`
  margin: 0 ${rem(8)};
`;

const runButtonStyles = css`

`;

const docsButtonStyles = css`
  margin: 0 0 0 auto;
`;

const labelStyles = css`
  font-size: ${rem(16)};
`;

const checkboxStyles = css`
  appearance: none;
  width: ${rem(20)};
  height: ${rem(20)};
  margin-right: ${rem(8)};
  border-radius: ${rem(3)};
`;

const logoStyles = css`
  position: absolute;
  bottom: ${rem(16)};
  right: ${rem(16)};
`;


export const Explorer = ({ navigationProps }) => {
  const graphiQLRef = useRef<GraphiQL>(null);
  const schema = useReactiveVar(graphiQLSchema);
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(FetchPolicy.NoCache);

  const theme = useReactiveVar(colorTheme);
  const query = useReactiveVar(graphiQLQuery);

  const executeOperation = ({ 
    query, 
    operationName, 
    variables, 
    fetchPolicy = queryCache,
  }) => new Observable<FetchResult>(observer => {
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
    if (!schema) {
      const observer = executeOperation({ 
        query: getIntrospectionQuery(), 
        operationName: 'IntrospectionQuery', 
        variables: null,
        fetchPolicy: FetchPolicy.NoCache, 
      });
  
      observer.subscribe(response => {
        graphiQLSchema(buildClientSchema(response.data as IntrospectionQuery));
      });
    }
  }, [schema]);

  const handleClickPrettifyButton = () => {
    const editor = graphiQLRef.current?.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };

  const handleToggleExplorer = () => setIsExplorerOpen(!isExplorerOpen);
  const handleToggleDocs = () => setIsDocsOpen(isDocsOpen);;

  return (
    <FullWidthLayout 
      navigationProps={navigationProps}
    >

        <GraphiQL
          ref={graphiQLRef}
          fetcher={(args => {
            // Ignore IntrospectionQuery from GraphiQL to prevent redundant introspections
            // We duplicate this call above so GraphiQLExplorer can access the schema
            if (args.operationName === 'IntrospectionQuery') {
              return Promise.resolve({});
            }

            return executeOperation(args);
          }) as any}
          schema={schema}
          query={query}
          editorTheme={theme === ColorTheme.Dark ? 'dracula' : 'graphiql'}
          onEditQuery={newQuery => graphiQLQuery(newQuery)}
          render={({ Logo, ExecuteButton, GraphiQLEditor, DocExplorer }) => {
            return (
              <Fragment>           
                <FullWidthLayout.Header css={headerStyles}>
                  <ExecuteButton />
                  <Button
                    css={buttonStyles}
                    title="Prettify"
                    onClick={handleClickPrettifyButton}
                  >
                    Prettify
                  </Button>
                  <Button
                    css={buttonStyles}
                    title="Toggle Explorer"
                    onClick={handleToggleExplorer}
                  >
                    Explorer
                  </Button>
                  <input
                    id="loadFromCache"
                    css={checkboxStyles}
                    type="checkbox"
                    name="loadFromCache"
                    checked={queryCache === FetchPolicy.CacheOnly}
                    onChange={() => setQueryCache(queryCache === FetchPolicy.CacheOnly ? FetchPolicy.NoCache : FetchPolicy.CacheOnly)}
                  />
                  <label 
                    htmlFor="loadFromCache"
                    css={labelStyles}
                  >
                    Load from cache
                  </label>
                  <Button
                    css={docsButtonStyles}
                    title="Open Document Explorer"
                    onClick={handleToggleDocs}
                  >
                    Docs
                  </Button>
                </FullWidthLayout.Header>
                <FullWidthLayout.Main>
                  <GraphiQLExplorer
                    schema={schema}
                    query={query}
                    onEdit={newQuery => graphiQLQuery(newQuery)}
                    explorerIsOpen={isExplorerOpen}
                    onToggleExplorer={handleToggleExplorer}
                  />
                  <GraphiQLEditor />
                  {isDocsOpen && <DocExplorer onToggleDocs={handleToggleDocs} />}
                  <Logo css={logoStyles} />
                </FullWidthLayout.Main>
              </Fragment>
            );
          }}
        />
    </FullWidthLayout>
  );
};

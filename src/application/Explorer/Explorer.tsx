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
import { useTheme, ColorTheme, colorTheme } from '../theme';
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
  border-bottom: ${rem(1)} solid;
  background-color: var(--primary);
  border-color: var(--primary);
`;

const mainStyles = css`
  display: flex;
`;

const buttonContainerStyles = css`
  display: inline-flex;
  justify-content: space-around;
  margin: 0 ${rem(16)};
`;

const buttonStyles = css`
  font-weight: normal;
  font-size: ${rem(16)};
  color: ${colors.white};

  &:hover {
    background-color: ${colors.blilet.base};
    color: ${colors.white};
  }
`;

const runButtonStyles = css`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: ${rem(4)};
  background-color: transparent;
  cursor: pointer;

  svg {
    fill: currentColor;
  }

  &:hover {
    background-color: ${colors.blilet.base};
  }
`;

const docsButtonStyles = css`
  ${buttonStyles}
  min-width: ${rem(60)};
  margin: 0 0 0 auto;
`;

const labelStyles = css`
  display: inline-flex;
  align-items: center;
  margin: 0 0 0 ${rem(36)};
  font-size: ${rem(16)};
  color: ${colors.white};
`;

const checkboxStyles = css`
  appearance: none;
  width: ${rem(20)};
  height: ${rem(20)};
  margin-right: ${rem(16)};
  border-radius: ${rem(4)};
  background-color: ${colors.white};

  &:checked {
    background-color: ${colors.blilet.base};
  }
`;

const logoStyles = css`
  position: absolute;
  bottom: ${rem(16)};
  right: ${rem(16)};
`;

const borderStyles = css`
  width: ${rem(1)};
  height: ${rem(26)};
  border-right: ${rem(1)} var(--whiteTransparent);
`;

export const Explorer = ({ navigationProps }) => {
  const graphiQLRef = useRef<GraphiQL>(null);
  const schema = useReactiveVar(graphiQLSchema);
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(FetchPolicy.NoCache);

  const color = useReactiveVar(colorTheme);
  const query = useReactiveVar(graphiQLQuery);

  const theme = useTheme();

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
  const handleToggleDocs = () => setIsDocsOpen(!isDocsOpen);;

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
          editorTheme={color === ColorTheme.Dark ? 'dracula' : 'graphiql'}
          onEditQuery={newQuery => graphiQLQuery(newQuery)}
          render={({ ExecuteButton, GraphiQLEditor, DocExplorer }) => {
            return (
              <Fragment>   
                <FullWidthLayout.Header 
                  css={headerStyles}
                >
                  <div css={borderStyles}></div>
                  <div css={buttonContainerStyles}>
                    <ExecuteButton css={[buttonStyles, runButtonStyles]} />
                    <Button
                      css={buttonStyles}
                      title="Prettify"
                      feel="flat"
                      onClick={handleClickPrettifyButton}
                    >
                      Prettify
                    </Button>
                    <Button
                      css={buttonStyles}
                      title="Toggle Explorer"
                      feel="flat"
                      onClick={handleToggleExplorer}
                    >
                      Explorer
                    </Button>
                  </div>
                  <div css={borderStyles}></div>
                  <label 
                    htmlFor="loadFromCache"
                    css={labelStyles}
                  >
                    <input
                      id="loadFromCache"
                      css={checkboxStyles}
                      type="checkbox"
                      name="loadFromCache"
                      checked={queryCache === FetchPolicy.CacheOnly}
                      onChange={() => setQueryCache(queryCache === FetchPolicy.CacheOnly ? FetchPolicy.NoCache : FetchPolicy.CacheOnly)}
                    />
                    Load from cache
                  </label>
                  <Button
                    css={docsButtonStyles}
                    title="Open Document Explorer"
                    feel="flat"
                    onClick={handleToggleDocs}
                  >
                    Docs
                  </Button>
                </FullWidthLayout.Header>
                <FullWidthLayout.Main
                  css={mainStyles}
                >
                  <GraphiQLExplorer
                    schema={schema}
                    query={query}
                    onEdit={newQuery => graphiQLQuery(newQuery)}
                    explorerIsOpen={isExplorerOpen}
                    onToggleExplorer={handleToggleExplorer}
                  />
                  {GraphiQLEditor}
                  {isDocsOpen && <DocExplorer onToggleDocs={handleToggleDocs} />}
                </FullWidthLayout.Main>
              </Fragment>
            );
          }}
        />
    </FullWidthLayout>
  );
};

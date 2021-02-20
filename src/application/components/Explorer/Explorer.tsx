/** @jsx jsx */

import React from "react";
import { jsx, css } from "@emotion/react";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { useRef, useState, useEffect, Fragment } from "react";
// @ts-ignore
import GraphiQL from "@forked/graphiql";
import {
  Observable,
  makeVar,
  useReactiveVar,
  FetchResult,
} from "@apollo/client";
import type { GraphQLSchema, IntrospectionQuery } from "graphql";
import { getIntrospectionQuery, buildClientSchema } from "graphql/utilities";
import { parse } from "graphql/language/parser";
import { print } from "graphql/language/printer";
import GraphiQLExplorer from "graphiql-explorer";
import { Button } from "@apollo/space-kit/Button";

import { ColorTheme, colorTheme } from "../../theme";
import {
  sendGraphiQLRequest,
  receiveGraphiQLResponses,
  listenForResponse,
} from "./graphiQLRelay";
import { FullWidthLayout } from "../Layouts/FullWidthLayout";

import "@forked/graphiql-css";

enum FetchPolicy {
  NoCache = "no-cache",
  CacheOnly = "cache-only",
}

export const graphiQLQuery = makeVar<string>("");
export const graphiQLSchema = makeVar<GraphQLSchema | undefined>(undefined);

export const resetGraphiQLVars = () => {
  graphiQLQuery("");
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
`;

const buttonStyles = css`
  font-weight: normal;
  font-size: ${rem(14)};
  color: ${colors.white};
  margin-right: ${rem(10)};
  min-width: inherit;

  &:hover,
  &:active,
  &:focus {
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
  margin-bottom: 0;

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
  margin: 0 0 0 1rem;
  font-size: ${rem(14)};
  color: ${colors.white};
  line-height: ${rem(17)};
`;

const checkboxStyles = css`
  margin-right: ${rem(10)};
`;

const borderStyles = css`
  width: ${rem(1)};
  height: ${rem(26)};
  border-right: ${rem(1)} var(--whiteTransparent);
`;

const explorerStyles = css`
  .graphiql-explorer-root > div {
    overflow: auto !important;
  }

  .graphiql-explorer-root > div > div {
    outline: none;
  }

  .graphiql-operation-title-bar {
    margin-top: ${rem(10)};
    line-height: ${rem(30)};
    padding-bottom: 0 !important;

    button {
      outline: none;
    }

    input {
      border: 1px solid rgb(221, 221, 221) !important;
      box-shadow: none;
      padding: 5px;
      width: ${rem(200)} !important;
    }
  }

  .docExplorerWrap {
    box-shadow: none;
    border-right: 1px solid #ddd;
  }

  .graphiql-explorer-actions {
    select {
      margin-left: ${rem(5)};
      outline: none;
      border-color: #ccc;
    }
    button {
      outline: none;
    }
  }

  .toolbar-button {
    outline: none;
  }

  .graphiql-explorer-node {
    margin-left: 0.2rem;
    .toolbar-button {
      font-size: ${rem(14)} !important;
    }
  }

  .doc-explorer-title {
    padding: 0;
  }

  .doc-explorer-contents {
    top: 0;
    position: relative;
    overflow-y: auto !important;
    padding-bottom: 1.2rem !important;
  }
`;

const explorerActionButtonStyles = {
  actionButtonStyle: {
    padding: `0 0 0 ${rem(5)}`,
    margin: 0,
    backgroundColor: "white",
    border: "none",
    fontSize: rem(20),
    display: "inline-block",
  },
};

export const Explorer = ({ navigationProps }) => {
  const graphiQLRef = useRef<GraphiQL>(null);
  const schema = useReactiveVar(graphiQLSchema);
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(
    FetchPolicy.NoCache
  );

  const color = useReactiveVar(colorTheme);
  const query = useReactiveVar(graphiQLQuery);

  const executeOperation = ({
    query,
    operationName,
    variables,
    fetchPolicy = queryCache,
  }) =>
    new Observable<FetchResult>((observer) => {
      const payload = JSON.stringify({
        query,
        operationName,
        variables,
        fetchPolicy,
      });

      sendGraphiQLRequest(payload);
      listenForResponse(operationName, (payload) => {
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
        operationName: "IntrospectionQuery",
        variables: null,
        fetchPolicy: FetchPolicy.NoCache,
      });

      observer.subscribe((response) => {
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
  const handleToggleDocs = () => setIsDocsOpen(!isDocsOpen);

  return (
    <FullWidthLayout navigationProps={navigationProps}>
      <GraphiQL
        ref={graphiQLRef}
        fetcher={
          ((args) => {
            // Ignore IntrospectionQuery from GraphiQL to prevent redundant introspections
            // We duplicate this call above so GraphiQLExplorer can access the schema
            if (args.operationName === "IntrospectionQuery") {
              return Promise.resolve({});
            }

            return executeOperation(args);
          }) as any
        }
        schema={schema}
        query={query}
        editorTheme={color === ColorTheme.Dark ? "dracula" : "graphiql"}
        onEditQuery={(newQuery) => graphiQLQuery(newQuery)}
        render={({ ExecuteButton, GraphiQLEditor, DocExplorer }) => {
          return (
            <Fragment>
              <FullWidthLayout.Header css={headerStyles}>
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
                    Build
                  </Button>
                </div>
                <div css={borderStyles}></div>
                <label htmlFor="loadFromCache" css={labelStyles}>
                  <input
                    id="loadFromCache"
                    css={checkboxStyles}
                    type="checkbox"
                    name="loadFromCache"
                    checked={queryCache === FetchPolicy.CacheOnly}
                    onChange={() =>
                      setQueryCache(
                        queryCache === FetchPolicy.CacheOnly
                          ? FetchPolicy.NoCache
                          : FetchPolicy.CacheOnly
                      )
                    }
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
              <FullWidthLayout.Main css={mainStyles}>
                <div css={explorerStyles}>
                  <GraphiQLExplorer
                    title="Build"
                    schema={schema}
                    query={query}
                    onEdit={(newQuery) => {
                      // Before passing a query to graphiql to be run, we'll
                      // make sure it doesn't include an empty top level
                      // selection set. If it does and graphiql tries to run
                      // it, graphiql-explorer (3rd party plugin) functionality
                      // will break. This means new graphiql-explorer
                      // started queries will always be valid queries, including
                      // `__typename` at a minimum.
                      const queryWithoutNewlines = newQuery.replace("\n", "");
                      const cleanQuery =
                        !!queryWithoutNewlines &&
                        !queryWithoutNewlines.includes("{")
                          ? `${queryWithoutNewlines} {\n  __typename\n}`
                          : newQuery;
                      graphiQLQuery(cleanQuery);
                    }}
                    explorerIsOpen={isExplorerOpen}
                    onToggleExplorer={handleToggleExplorer}
                    styles={explorerActionButtonStyles}
                  />
                </div>
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

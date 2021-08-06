/** @jsx jsx */

import React from "react";
import { jsx, css } from "@emotion/react";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { useState, useEffect } from "react";
import {
  Observable,
  makeVar,
  useReactiveVar,
  FetchResult,
} from "@apollo/client";
import type { GraphQLSchema, IntrospectionQuery } from "graphql";
import { getIntrospectionQuery, buildClientSchema } from "graphql/utilities";
import { colorTheme } from "../../theme";
import {
  sendGraphiQLRequest,
  receiveGraphiQLResponses,
  listenForResponse,
} from "./graphiQLRelay";
import { FullWidthLayout } from "../Layouts/FullWidthLayout";

enum FetchPolicy {
  NoCache = "no-cache",
  CacheOnly = "cache-only",
}

interface GraphiQLOperation {
  operation: string;
  variables?: Record<string, any>;
}

export const graphiQLOperation = makeVar<GraphiQLOperation>({ operation: "" });
export const graphiQLSchema = makeVar<GraphQLSchema | undefined>(undefined);

export const resetGraphiQLVars = () => {
  graphiQLOperation({ operation: "" });
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

function executeOperation({
  operation,
  operationName,
  variables,
  fetchPolicy,
}) {
  return new Observable<FetchResult>((observer) => {
    const payload = JSON.stringify({
      operation,
      operationName,
      variables,
      fetchPolicy,
    });

    sendGraphiQLRequest(payload);

    listenForResponse(operationName, (response) => {
      observer.next(response);
      observer.complete();
    });
  });
}

export const Explorer = ({ navigationProps }) => {
  const schema = useReactiveVar(graphiQLSchema);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(
    FetchPolicy.NoCache
  );

  const color = useReactiveVar(colorTheme);
  const { operation, variables } = useReactiveVar(graphiQLOperation);

  // Subscribe to GraphiQL data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveGraphiQLResponses());

  useEffect(() => {
    if (!schema) {
      const observer = executeOperation({
        operation: getIntrospectionQuery(),
        operationName: "IntrospectionQuery",
        variables: null,
        fetchPolicy: FetchPolicy.NoCache,
      });

      observer.subscribe((response) => {
        graphiQLSchema(buildClientSchema(response.data as IntrospectionQuery));
      });
    }
  }, [schema]);

  return (
    <FullWidthLayout navigationProps={navigationProps}>
        <FullWidthLayout.Header css={headerStyles}>
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
        </FullWidthLayout.Header>
        <FullWidthLayout.Main css={mainStyles}>
        </FullWidthLayout.Main>
    </FullWidthLayout>
  );
};

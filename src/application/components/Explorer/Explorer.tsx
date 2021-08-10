/** @jsx jsx */

import React from "react";
import { jsx, css } from "@emotion/react";
import { rem } from "polished";
import { colors } from "@apollo/space-kit/colors";
import { useState, useEffect } from "react";
import {
  Observable,
  useReactiveVar,
  FetchResult,
} from "@apollo/client";
import type { IntrospectionQuery } from "graphql";
import { getIntrospectionQuery } from "graphql/utilities";
import { colorTheme } from "../../theme";
import {
  receiveExplorerResponses,
  sendExplorerRequest,
  listenForResponse,
} from "./explorerRelay";
import { FullWidthLayout } from "../Layouts/FullWidthLayout";
import { EMBEDDABLE_EXPLORER_URL } from "../../../extension/constants";

enum FetchPolicy {
  NoCache = "no-cache",
  CacheOnly = "cache-only",
}

const headerStyles = css`
  display: flex;
  align-items: center;
  padding: 0 ${rem(16)};
  background-color: var(--primary);
  box-shadow: 0 ${rem(-1)} 0 0 rgba(255, 255, 255, 0.3) inset;
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

const iFrameStyles = css`
  width: 100vw;
  height: 100%;
  border: none;
`;

function executeOperation({
  operation,
  operationName,
  variables,
  fetchPolicy,
  customHeaders,
}: {
  operation: string,
  operationName: string,
  variables: string | null,
  fetchPolicy: FetchPolicy,
  customHeaders?: Record<string, string>,
}) {
  return new Observable<FetchResult>((observer) => {
    const payload = JSON.stringify({
      operation,
      operationName,
      variables,
      fetchPolicy,
      customHeaders,
    });

    sendExplorerRequest(payload);

    listenForResponse(operationName, (response) => {
      observer.next(response);
      observer.complete();
    });
  });
}

export const Explorer = ({ navigationProps, embeddedExplorerProps }: {
  navigationProps: {
    queriesCount: number,
    mutationsCount: number,
  }
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null,
    setEmbeddedExplorerIFrame: (iframe: HTMLIFrameElement) => void,
  }
}): jsx.JSX.Element => {
  const [schema, setSchema] = useState<IntrospectionQuery | null>(null)
  const [queryCache, setQueryCache] = useState<FetchPolicy>(
    FetchPolicy.NoCache
  );

  const { embeddedExplorerIFrame, setEmbeddedExplorerIFrame } = embeddedExplorerProps;

  // TODO: (Maya) send theme via query params to embedded explorer 
  const color = useReactiveVar(colorTheme);

  // Subscribe to Explorer data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveExplorerResponses());

  // Set embedded explorer iframe if loaded
  useEffect(() => {
    const iframe = document.getElementById('embedded-explorer') as HTMLIFrameElement;
    const onPostMessageReceived = (event:MessageEvent<{
      name: string,
    }>) => {
      // Embedded Explorer sends us a PM when it has loaded
      if(event.data.name === 'ExplorerLoaded') {
        setEmbeddedExplorerIFrame(iframe);
      }
    }
    window.addEventListener('message', onPostMessageReceived);

    return () => window.removeEventListener('message', onPostMessageReceived);
  }, [setEmbeddedExplorerIFrame])

  useEffect(() => {
    if (!schema && embeddedExplorerIFrame) {
      const observer = executeOperation({
        operation: getIntrospectionQuery(),
        operationName: "IntrospectionQuery",
        variables: null,
        fetchPolicy: queryCache,
      });

      observer.subscribe((response) => {
        setSchema(response.data as IntrospectionQuery)
        // send introspected schema to embedded explorer
        embeddedExplorerIFrame.contentWindow?.postMessage({
          name: 'IntrospectionSchema',
          schema: response.data
        }, EMBEDDABLE_EXPLORER_URL);
      });
    }
  }, [schema, embeddedExplorerIFrame, queryCache]);

  useEffect(() => {
    if(schema && embeddedExplorerIFrame) {
      const onPostMessageReceived = (event:MessageEvent<{
        name: string,
        operation: string,
        operationName: string,
        variables: string,
        headers: Record<string, string>,
      }>) => {
        // Network request communications will come from the explorer
        // in the form ExplorerRequest:id for queries and mutations
        // and in the form ExplorerSubscriptionRequest:id for subscriptions
        if(event.data.name.startsWith('ExplorerRequest:') || event.data.name.startsWith('ExplorerSubscriptionRequest:')) {
          const currentOperationId = event.data.name.split(':')[1]
          const observer = executeOperation({
            operation: event.data.operation,
            operationName: event.data.operationName,
            variables: event.data.variables,
            fetchPolicy: FetchPolicy.NoCache,
            customHeaders: event.data.headers,
          });

          observer.subscribe((response) => {
            embeddedExplorerIFrame.contentWindow?.postMessage({
              name: event.data.name.startsWith('ExplorerRequest:') ?
                `ExplorerResponse:${currentOperationId}` :
                `ExplorerSubscriptionResponse:${currentOperationId}`,
              response: response
            }, EMBEDDABLE_EXPLORER_URL);
          });
        }
      }
      window.addEventListener('message', onPostMessageReceived);

      return () => window.removeEventListener('message', onPostMessageReceived);
    }
  }, [schema, embeddedExplorerIFrame])

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
                setQueryCache((prev) =>
                  prev === FetchPolicy.CacheOnly
                    ? FetchPolicy.NoCache
                    : FetchPolicy.CacheOnly
                )
              }
            />
            Load from cache
          </label>
        </FullWidthLayout.Header>
        <FullWidthLayout.Main css={mainStyles}>
          <iframe id="embedded-explorer" css={iFrameStyles} src={EMBEDDABLE_EXPLORER_URL}/>
        </FullWidthLayout.Main>
    </FullWidthLayout>
  );
};

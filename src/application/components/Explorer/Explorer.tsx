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
  NetworkStatus,
} from "@apollo/client";
import type { IntrospectionQuery } from "graphql";
import { getIntrospectionQuery } from "graphql/utilities";
import { colorTheme } from "../../theme";
import {
  receiveExplorerResponses,
  sendExplorerRequest,
  listenForResponse,
  sendSubscriptionTerminationRequest,
} from "./explorerRelay";
import { FullWidthLayout } from "../Layouts/FullWidthLayout";
import { QueryResult } from "../../../types";
import { EMBEDDABLE_EXPLORER_URL, EXPLORER_SUBSCRIPTION_TERMINATION } from "../../../extension/constants";

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

export type JSONPrimitive = boolean | null | string | number;
export type JSONObject = { [key in string]?: JSONValue };
export type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;


function executeOperation({
  operation,
  operationName,
  variables,
  fetchPolicy,
  isSubscription,
}: {
  operation: string,
  operationName?: string,
  variables?: JSONValue,
  fetchPolicy: FetchPolicy,
  isSubscription?: boolean,
}) {
  return new Observable<FetchResult>((observer) => {
    const payload = JSON.stringify({
      operation,
      operationName,
      variables,
      fetchPolicy,
    });

    sendExplorerRequest(payload);

    listenForResponse((response) => {
      observer.next(response);
      if(isSubscription) {
        const checkForSubscriptionTermination = (event: MessageEvent) => {
          if(event.data.name.startsWith(EXPLORER_SUBSCRIPTION_TERMINATION)) {
            sendSubscriptionTerminationRequest();
            observer.complete();
            window.removeEventListener('message', checkForSubscriptionTermination);
          }
        }

        window.addEventListener('message', checkForSubscriptionTermination);
      }
      else {
        observer.complete();
      }
    }, operationName, !!isSubscription,);
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
        isSubscription: false,
        fetchPolicy: FetchPolicy.NoCache,
      });

      observer.subscribe((response: QueryResult) => {
        if(response.networkStatus === NetworkStatus.error) {
          embeddedExplorerIFrame.contentWindow?.postMessage({
            name: 'IntrospectionError',
            schema: response.data,
            errors: response.errors,
            error: response.error?.message,
          }, EMBEDDABLE_EXPLORER_URL);
        } else {
          setSchema(response.data as IntrospectionQuery)
          // send introspected schema to embedded explorer
          embeddedExplorerIFrame.contentWindow?.postMessage({
            name: 'IntrospectionSchema',
            schema: response.data
          }, EMBEDDABLE_EXPLORER_URL);
        }
      });
    }
  }, [schema, embeddedExplorerIFrame]);

  useEffect(() => {
    if(embeddedExplorerIFrame) {
      const onPostMessageReceived = (event:MessageEvent<{
        name?: string,
        operation?: string,
        operationName?: string,
        variables?: string,
        headers?:string
      }>) => {
        const isQueryOrMutation = event.data.name?.startsWith('ExplorerRequest:');
        const isSubscription = event.data.name?.startsWith('ExplorerSubscriptionRequest:');
        const currentOperationId = event.data.name?.split(':')[1]
        if((isQueryOrMutation || isSubscription) && event.data.operation) {
          const observer =  executeOperation({
            operation: event.data.operation,
            operationName: event.data.operationName,
            variables: event.data.variables,
            fetchPolicy: queryCache,
            isSubscription,
          });

          observer.subscribe((response) => {
            embeddedExplorerIFrame.contentWindow?.postMessage({
              name: isQueryOrMutation ?
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
  }, [embeddedExplorerIFrame, queryCache])

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
          <iframe id="embedded-explorer" css={iFrameStyles} src={`${EMBEDDABLE_EXPLORER_URL}?showHeadersAndEnvVars=false&theme=${color}`}/>
        </FullWidthLayout.Main>
    </FullWidthLayout>
  );
};

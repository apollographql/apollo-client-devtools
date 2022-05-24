/** @jsx jsx */

import React, { useMemo } from "react";
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
import {
  postMessageToEmbed,
  EMBEDDABLE_EXPLORER_URL,
  EXPLORER_REQUEST,
  EXPLORER_RESPONSE,
  EXPLORER_SUBSCRIPTION_REQUEST,
  EXPLORER_SUBSCRIPTION_RESPONSE,
  EXPLORER_SUBSCRIPTION_TERMINATION,
  JSONValue,
  SCHEMA_ERROR,
  SCHEMA_RESPONSE,
  IncomingMessageEvent,
} from "./postMessageHelpers";
import {
  EXPLORER_LISTENING_FOR_HANDSHAKE,
  handleAuthenticationPostMessage,
  sendHandshakeToEmbed,
} from "./postMessageAuthHelpers";
import { GraphRefModal } from "./GraphRefModal";

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
  margin: 0 2rem 0 0;
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

const authorizeButtonStyles = css`
  width: 185px;
  height: 25px;
  cursor: pointer;
  border: none;
  border-radius: 2px;
  color: ${colors.grey.darker};
  font-size: 13px;
`;

function executeOperation({
  operation,
  operationName,
  variables,
  fetchPolicy,
  isSubscription,
}: {
  operation: string;
  operationName?: string;
  variables?: JSONValue;
  fetchPolicy: FetchPolicy;
  isSubscription?: boolean;
}) {
  return new Observable<FetchResult>((observer) => {
    const payload = JSON.stringify({
      operation,
      operationName,
      variables,
      fetchPolicy,
    });

    sendExplorerRequest(payload);

    listenForResponse(
      (response) => {
        observer.next(response);
        if (isSubscription) {
          const checkForSubscriptionTermination = (event: MessageEvent) => {
            if (event.data.name.startsWith(EXPLORER_SUBSCRIPTION_TERMINATION)) {
              sendSubscriptionTerminationRequest();
              observer.complete();
              window.removeEventListener(
                "message",
                checkForSubscriptionTermination
              );
            }
          };

          window.addEventListener("message", checkForSubscriptionTermination);
        } else {
          observer.complete();
        }
      },
      operationName,
      !!isSubscription
    );
  });
}

const getGraphRefFromLocalStorage = () => {
  const graphRefsByParentHostnameString =
    window.localStorage.getItem("explorerGraphRefs");
  const graphRefsByParentHostname = graphRefsByParentHostnameString
    ? JSON.parse(graphRefsByParentHostnameString)
    : {};
  return graphRefsByParentHostname["temp-key"];
};

const setGraphRefFromLocalStorage = (graphRef: string) => {
  const graphRefsByParentHostnameString =
    window.localStorage.getItem("explorerGraphRefs");
  const graphRefsByParentHostname = graphRefsByParentHostnameString
    ? JSON.parse(graphRefsByParentHostnameString)
    : {};
  graphRefsByParentHostname["temp-key"] = graphRef;
  window.localStorage.setItem(
    "explorerGraphRefs",
    JSON.stringify(graphRefsByParentHostname)
  );
};

export const Explorer = ({
  isVisible,
  navigationProps,
  embeddedExplorerProps,
}: {
  isVisible: boolean | undefined;
  navigationProps: {
    queriesCount: number;
    mutationsCount: number;
  };
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null;
    setEmbeddedExplorerIFrame: (iframe: HTMLIFrameElement) => void;
  };
}): jsx.JSX.Element => {
  const [graphRef, setGraphRef] = useState<string>();
  const [showGraphRefModal, setShowGraphRefModal] = useState<
    false | "triggeredByIntrospectionFailure" | "triggeredManually"
  >(false);
  const showGraphRefModalAndIsVisible = isVisible && showGraphRefModal;
  const [newGraphRefLoading, setNewGraphRefLoading] = useState(false);

  // set local storage whenever local state changes
  useEffect(() => {
    if (graphRef) setGraphRefFromLocalStorage(graphRef);
  }, [graphRef]);

  const [schema, setSchema] = useState<IntrospectionQuery | null>(null);
  const [queryCache, setQueryCache] = useState<FetchPolicy>(
    FetchPolicy.NoCache
  );

  const { embeddedExplorerIFrame, setEmbeddedExplorerIFrame } =
    embeddedExplorerProps;

  const color = useReactiveVar(colorTheme);

  // Subscribe to Explorer data responses
  // Returns a cleanup method to useEffect
  useEffect(() => receiveExplorerResponses());

  // Set embedded explorer iframe if loaded
  useEffect(() => {
    const iframe = document.getElementById(
      "embedded-explorer"
    ) as HTMLIFrameElement;
    const onPostMessageReceived = (event: IncomingMessageEvent) => {
      if (event.data.name === EXPLORER_LISTENING_FOR_HANDSHAKE) {
        setEmbeddedExplorerIFrame(iframe);
        sendHandshakeToEmbed({
          embeddedExplorerIFrame: iframe,
          graphRef,
        });
      }
      const onAuthHandshakeReceived = () => {
        // if there was a graph ref change, we have now loaded the auth details from the explorer
        setNewGraphRefLoading(false);
        setShowGraphRefModal(false);
      };
      handleAuthenticationPostMessage({
        embeddedExplorerIFrame: iframe,
        event,
        setGraphRef,
        closeGraphRefModal: () => setShowGraphRefModal(false),
        onAuthHandshakeReceived,
      });
    };
    window.addEventListener("message", onPostMessageReceived);

    return () => window.removeEventListener("message", onPostMessageReceived);
  }, [graphRef, setEmbeddedExplorerIFrame]);

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
        // If we have errors in the response it means we assume this was a graphql
        // response which means we did hit a graphql endpoint but introspection
        // was specifically disabled
        if (response.errors) {
          // if you can't introspect the schema, default to the last used
          // graph ref, otherwise, trigger the embed to ask the user
          // for their graph ref, and allow them to authenticate
          const graphRefFromLocalStorage = getGraphRefFromLocalStorage();
          if (graphRefFromLocalStorage) {
            setGraphRef(graphRefFromLocalStorage);
          } else {
            setShowGraphRefModal("triggeredByIntrospectionFailure");
          }
        }
        if (response.networkStatus === NetworkStatus.error) {
          postMessageToEmbed({
            embeddedExplorerIFrame,
            message: {
              name: SCHEMA_ERROR,
              errors: response.errors,
              error: response.error?.message,
            },
          });
        } else {
          setSchema(response.data as IntrospectionQuery);
          // send introspected schema to embedded explorer
          postMessageToEmbed({
            embeddedExplorerIFrame,
            message: {
              name: SCHEMA_RESPONSE,
              schema: response.data,
            },
          });
        }
      });
    }
  }, [schema, embeddedExplorerIFrame]);

  useEffect(() => {
    if (embeddedExplorerIFrame) {
      const onPostMessageReceived = (event: IncomingMessageEvent) => {
        const isQueryOrMutation = event.data.name === EXPLORER_REQUEST;
        const isSubscription =
          event.data.name === EXPLORER_SUBSCRIPTION_REQUEST;
        if ((isQueryOrMutation || isSubscription) && event.data.operation) {
          const observer = executeOperation({
            operation: event.data.operation,
            operationName: event.data.operationName,
            variables: event.data.variables,
            fetchPolicy: queryCache,
            isSubscription,
          });
          const currentOperationId = event.data.operationId;

          observer.subscribe((response) => {
            postMessageToEmbed({
              embeddedExplorerIFrame,
              message: {
                name: isQueryOrMutation
                  ? EXPLORER_RESPONSE
                  : EXPLORER_SUBSCRIPTION_RESPONSE,
                operationId: currentOperationId,
                response: response,
              },
            });
          });
        }
      };
      window.addEventListener("message", onPostMessageReceived);

      return () => window.removeEventListener("message", onPostMessageReceived);
    }
  }, [embeddedExplorerIFrame, graphRef, queryCache]);

  const embedIframeSrcString = useMemo(
    () =>
      `${EMBEDDABLE_EXPLORER_URL}?sendRequestsFrom=parent&shouldPersistState=false&showHeadersAndEnvVars=false&shouldShowGlobalHeader=false&parentSupportsSubscriptions=true&theme=${color}${
        graphRef ? `&graphRef=${graphRef}` : ""
      }`,
    [color, graphRef]
  );

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
        {embeddedExplorerIFrame && graphRef && (
          <button
            css={authorizeButtonStyles}
            onClick={() => {
              setShowGraphRefModal("triggeredManually");
            }}
          >
            Choose a different Studio graph
          </button>
        )}
      </FullWidthLayout.Header>
      <FullWidthLayout.Main css={mainStyles}>
        <iframe
          id="embedded-explorer"
          css={iFrameStyles}
          src={embedIframeSrcString}
        />
        {showGraphRefModalAndIsVisible && embeddedExplorerIFrame && (
          <GraphRefModal
            graphRef={graphRef}
            setGraphRef={setGraphRef}
            embeddedExplorerIFrame={embeddedExplorerIFrame}
            onClose={() => setShowGraphRefModal(false)}
            setNewGraphRefLoading={setNewGraphRefLoading}
            newGraphRefLoading={newGraphRefLoading}
            wasTriggeredByIntrospectionFailure={
              showGraphRefModal === "triggeredByIntrospectionFailure"
            }
          />
        )}
      </FullWidthLayout.Main>
    </FullWidthLayout>
  );
};

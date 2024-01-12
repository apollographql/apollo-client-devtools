import { useMemo } from "react";
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
import { Button } from "../Button";

export enum FetchPolicy {
  NoCache = "no-cache",
  CacheOnly = "cache-only",
}

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
  return window.localStorage.getItem("explorerGraphRef");
};

const setGraphRefFromLocalStorage = (graphRef: string) => {
  window.localStorage.setItem("explorerGraphRef", graphRef);
};

export const Explorer = ({
  isVisible,
  embeddedExplorerProps,
}: {
  isVisible: boolean | undefined;
  embeddedExplorerProps: {
    embeddedExplorerIFrame: HTMLIFrameElement | null;
    setEmbeddedExplorerIFrame: (iframe: HTMLIFrameElement) => void;
  };
}): JSX.Element => {
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
    <FullWidthLayout>
      <FullWidthLayout.Header className="flex items-center border-b border-primary dark:border-primary-dark">
        <label
          htmlFor="loadFromCache"
          className="flex items-center mr-8 text-sm"
        >
          <input
            id="loadFromCache"
            className="mr-3"
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
          <Button
            onClick={() => {
              setShowGraphRefModal("triggeredManually");
            }}
            variant="hidden"
            size="xs"
          >
            Choose a different Studio graph
          </Button>
        )}
      </FullWidthLayout.Header>
      <FullWidthLayout.Main className="flex">
        <iframe
          id="embedded-explorer"
          className="w-[100vw] h-full border-none"
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

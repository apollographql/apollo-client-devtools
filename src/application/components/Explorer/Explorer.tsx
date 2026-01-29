import {
  useMemo,
  useState,
  useEffect,
  useImperativeHandle,
  useRef,
  useEffectEvent,
  useCallback,
} from "react";
import { Observable, gql } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";
import type { IntrospectionQuery } from "graphql";
import { getIntrospectionQuery } from "graphql/utilities";
import { colorTheme } from "../../theme";
import { FullWidthLayout } from "../Layouts/FullWidthLayout";
import type {
  ExplorerResponse,
  IncomingMessageEvent,
  OutgoingMessageEvent,
} from "./postMessageHelpers";
import {
  postMessageToEmbed,
  EMBEDDABLE_EXPLORER_URL,
  EXPLORER_REQUEST,
  EXPLORER_RESPONSE,
  EXPLORER_SUBSCRIPTION_REQUEST,
  EXPLORER_SUBSCRIPTION_RESPONSE,
  EXPLORER_SUBSCRIPTION_TERMINATION,
  SCHEMA_ERROR,
  SCHEMA_RESPONSE,
} from "./postMessageHelpers";
import {
  EXPLORER_LISTENING_FOR_HANDSHAKE,
  handleAuthenticationPostMessage,
  sendHandshakeToEmbed,
} from "./postMessageAuthHelpers";
import { GraphRefModal } from "./GraphRefModal";
import { Button } from "../Button";
import { getPanelActor } from "../../../extension/devtools/panelActor";
import type { JSONObject } from "../../types/json";

const panelWindow = getPanelActor(window);

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
  clientId,
}: {
  operation: string;
  operationName?: string;
  variables?: JSONObject;
  fetchPolicy: FetchPolicy;
  isSubscription?: boolean;
  clientId: string;
}) {
  return new Observable<ExplorerResponse>((observer) => {
    panelWindow.send({
      type: "explorerRequest",
      payload: {
        clientId,
        operation: gql(operation),
        operationName,
        variables,
        fetchPolicy,
      },
    });

    const removeListener = panelWindow.on("explorerResponse", (message) => {
      const { payload } = message;

      if (payload.operationName !== operationName) {
        return;
      }

      observer.next(payload.response);

      if (isSubscription) {
        const checkForSubscriptionTermination = (event: MessageEvent) => {
          if (event.data.name.startsWith(EXPLORER_SUBSCRIPTION_TERMINATION)) {
            panelWindow.send({ type: "explorerSubscriptionTermination" });
            observer.complete();
            window.removeEventListener(
              "message",
              checkForSubscriptionTermination
            );
            removeListener();
          }
        };

        window.addEventListener("message", checkForSubscriptionTermination);
      } else {
        observer.complete();
        // Queries and Mutation can be closed after a single response comes back,
        // but we need to listen until we are told to stop for Subscriptions
        removeListener();
      }
    });
  });
}

const getGraphRefFromLocalStorage = () => {
  return window.localStorage.getItem("explorerGraphRef");
};

const setGraphRefFromLocalStorage = (graphRef: string) => {
  window.localStorage.setItem("explorerGraphRef", graphRef);
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace Explorer {
  export interface Ref {
    postMessage: (message: OutgoingMessageEvent) => void;
  }
}

export const Explorer = ({
  clientId,
  isVisible,
  explorerRef,
}: {
  clientId: string | undefined;
  isVisible: boolean | undefined;
  explorerRef: React.RefObject<Explorer.Ref | null>;
}) => {
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

  const [queryCache, setQueryCache] = useState<FetchPolicy>(
    FetchPolicy.NoCache
  );

  const postMessage = useCallback((message: OutgoingMessageEvent) => {
    iframeRef.current.promise.then((embeddedExplorerIFrame) => {
      postMessageToEmbed({
        embeddedExplorerIFrame,
        message,
      });
    });
  }, []);
  useImperativeHandle(
    explorerRef,
    () => ({
      postMessage,
    }),
    [postMessage]
  );

  const color = useReactiveVar(colorTheme);

  const iframeRef = useRef(Promise.withResolvers<HTMLIFrameElement>());

  function iframeRefFn(iframe: HTMLIFrameElement) {
    function onPostMessageReceived(event: IncomingMessageEvent) {
      if (event.data.name === EXPLORER_LISTENING_FOR_HANDSHAKE) {
        iframeRef.current.resolve(iframe);
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
    }

    window.addEventListener("message", onPostMessageReceived);
    return () => window.removeEventListener("message", onPostMessageReceived);
  }

  const lastIntrospection = useRef<{
    clientId: null | string;
  }>({
    clientId: null,
  });

  const runIntrospectionQuery = useEffectEvent(() => {
    if (!clientId) {
      return;
    }
    const last = lastIntrospection.current;
    if (last && last.clientId === clientId) {
      return;
    }
    lastIntrospection.current = {
      clientId: clientId,
    };
    const observer = executeOperation({
      clientId,
      operation: getIntrospectionQuery(),
      operationName: "IntrospectionQuery",
      variables: undefined,
      isSubscription: false,
      fetchPolicy: FetchPolicy.NoCache,
    });

    observer.subscribe({
      next: (response) => {
        // This means this was a graphql response which means we did hit a
        // graphql endpoint but introspection was specifically disabled
        if (response.error || response.errors) {
          // if you can't introspect the schema, default to the last used
          // graph ref, otherwise, trigger the embed to ask the user
          // for their graph ref, and allow them to authenticate
          const graphRefFromLocalStorage = getGraphRefFromLocalStorage();
          if (graphRefFromLocalStorage) {
            setGraphRef(graphRefFromLocalStorage);
          } else {
            // Delay opening the modal for a moment. If the "Run in Explorer" button
            // navigates here, this might cause the HeadlessUI Dialog to call `onClose`
            // immediately because of the tab change
            setTimeout(() => {
              setShowGraphRefModal("triggeredByIntrospectionFailure");
            }, 100);
          }

          postMessage({
            name: SCHEMA_ERROR,
            errors: response.errors,
            error: response.error?.message,
          });
        } else {
          // send introspected schema to embedded explorer
          postMessage({
            name: SCHEMA_RESPONSE,
            schema: response.data as unknown as IntrospectionQuery,
          });
        }
      },
    });
  });

  // If the selected client has changed, make sure we re-run the introspection
  // query in case the client points to a different GraphQL schema.
  useEffect(() => {
    if (clientId && isVisible) {
      runIntrospectionQuery();
    }
  }, [clientId, isVisible]);

  useEffect(() => {
    if (clientId) {
      const onPostMessageReceived = (event: IncomingMessageEvent) => {
        const isQueryOrMutation = event.data.name === EXPLORER_REQUEST;
        const isSubscription =
          event.data.name === EXPLORER_SUBSCRIPTION_REQUEST;
        if ((isQueryOrMutation || isSubscription) && event.data.operation) {
          const observer = executeOperation({
            clientId,
            operation: event.data.operation,
            operationName: event.data.operationName,
            variables: event.data.variables ?? undefined,
            fetchPolicy: queryCache,
            isSubscription,
          });
          const currentOperationId = event.data.operationId;

          observer.subscribe((response) => {
            postMessage({
              name: isQueryOrMutation
                ? EXPLORER_RESPONSE
                : EXPLORER_SUBSCRIPTION_RESPONSE,
              operationId: currentOperationId,
              response,
            });
          });
        }
      };
      window.addEventListener("message", onPostMessageReceived);

      return () => window.removeEventListener("message", onPostMessageReceived);
    }
  }, [clientId, queryCache, postMessage]);

  const embedIframeSrcString = useMemo(
    () =>
      `${EMBEDDABLE_EXPLORER_URL}?sendRequestsFrom=parent&shouldPersistState=false&showHeadersAndEnvVars=false&shouldShowGlobalHeader=false&parentSupportsSubscriptions=true&theme=${color}${
        graphRef ? `&graphRef=${graphRef}` : ""
      }`,
    [color, graphRef]
  );

  return (
    <FullWidthLayout>
      <div className="py-2 px-4 flex items-center border-b border-primary dark:border-primary-dark">
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
        {graphRef && (
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
      </div>
      <FullWidthLayout.Main className="flex">
        <iframe
          id="embedded-explorer"
          className="w-dvw h-full border-none"
          src={embedIframeSrcString}
          ref={iframeRefFn}
        />
        {showGraphRefModalAndIsVisible && (
          <GraphRefModal
            graphRef={graphRef}
            setGraphRef={setGraphRef}
            postMessage={postMessage}
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

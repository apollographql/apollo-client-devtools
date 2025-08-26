import type { GraphQLFormattedError, IntrospectionQuery } from "graphql";

import type { JSONValue, JSONPrimitive, JSONObject } from "../../types/json";
import type { ObjMap } from "graphql/jsutils/ObjMap";
export type { JSONValue, JSONPrimitive, JSONObject };

export const EXPLORER_LISTENING_FOR_SCHEMA = "ExplorerListeningForSchema";
export const EXPLORER_LISTENING_FOR_STATE = "ExplorerListeningForState";
export const EXPLORER_REQUEST = "ExplorerRequest";
export const EXPLORER_RESPONSE = "ExplorerResponse";
export const EXPLORER_SUBSCRIPTION_REQUEST = "ExplorerSubscriptionRequest";
export const EXPLORER_SUBSCRIPTION_RESPONSE = "ExplorerSubscriptionResponse";
export const SET_OPERATION = "SetOperation";
export const SCHEMA_ERROR = "SchemaError";
export const SCHEMA_RESPONSE = "SchemaResponse";
export const DEV_TOOLS_AUTHENTICATE_WITH_GRAPHREF =
  "DevTools_AuthenticateWithGraphRef";

export const EMBEDDABLE_EXPLORER_URL =
  "https://explorer.embed.apollographql.com";
export const EXPLORER_SUBSCRIPTION_TERMINATION =
  "ExplorerSubscriptionTermination";

// https://github.com/apollographql/embeddable-explorer/blob/528d3791addb56b404fd875738526f67a16e23ba/packages/explorer/src/helpers/postMessageRelayHelpers.ts#L78
export interface ResponseData {
  data?: Record<string, unknown> | JSONValue | ObjMap<unknown>;
  path?: Array<string | number>;
  errors?: readonly GraphQLFormattedError[];
  extensions?: Record<string, any>;
}

// https://github.com/apollographql/embeddable-explorer/blob/528d3791addb56b404fd875738526f67a16e23ba/packages/explorer/src/helpers/postMessageRelayHelpers.ts#L73
export type ResponseError = {
  message: string;
  stack?: string;
};

// https://github.com/apollographql/embeddable-explorer/blob/528d3791addb56b404fd875738526f67a16e23ba/packages/explorer/src/helpers/postMessageRelayHelpers.ts#L84
export type ExplorerResponse = ResponseData & {
  incremental?: Array<
    ResponseData & { path: NonNullable<ResponseData["path"]> }
  >;
  error?: ResponseError;
  status?: number;
  headers?: Record<string, string> | Record<string, string>[];
  hasNext?: boolean;
  size?: number;
};

export type OutgoingMessageEvent =
  | {
      name: "SchemaError";
      error?: string;
      errors?: readonly GraphQLFormattedError[] | undefined;
    }
  | {
      name: "SchemaResponse";
      schema: IntrospectionQuery | string;
    }
  | {
      name: "HandshakeResponse";
      graphRef?: string;
      inviteToken?: string;
      accountId?: string;
    }
  | {
      name: "ExplorerResponse";
      operationId: string;
      response: ExplorerResponse;
    }
  | {
      name: "SetOperation";
      operation: string;
      variables: string;
    }
  | {
      name: "ExplorerSubscriptionResponse";
      operationId: string;
      response: ExplorerResponse;
    }
  | {
      name: "StudioUserTokenForEmbed";
      id: string;
      token: string;
      graphRef: string;
    }
  | {
      name: "PartialAuthenticationTokenResponse";
      partialToken: string;
    }
  | {
      name: "DevTools_AuthenticateWithGraphRef";
      graphRef: string;
    };

export type ExplorerRequest = MessageEvent<{
  name: "ExplorerRequest";
  operationId: string;
  operation: string;
  variables?: JSONObject | null;
  operationName?: string;
  headers: Record<string, string>;
  sandboxEndpointUrl?: string;
}>;

export type ExplorerSubscriptionRequest = MessageEvent<{
  name: "ExplorerSubscriptionRequest";
  operationId: string;
  operation: string;
  variables?: JSONObject | null;
  operationName?: string;
  headers: Record<string, string>;
}>;

export type ExplorerSubscriptionTermination = MessageEvent<{
  name: "ExplorerSubscriptionTermination";
  operationId: string;
}>;

export type ExplorerListening = MessageEvent<{
  name:
    | "ExplorerListeningForSchema"
    | "ExplorerListeningForState"
    | "ExplorerListeningForHandshake";
}>;

type ExplorerListeningForPartialToken = MessageEvent<{
  name: "ExplorerListeningForPartialToken";
  localStorageKey?: string;
}>;

export type ExplorerIntrospectionQueryWithHeaders = MessageEvent<{
  name: "IntrospectionQueryWithHeaders";
  introspectionRequestBody: string;
  introspectionRequestHeaders: Record<string, string>;
  sandboxEndpointUrl?: string;
}>;

type SetPartialAuthenticationTokenForParent = MessageEvent<{
  name: "SetPartialAuthenticationTokenForParent";
  localStorageKey: string;
  partialToken: string;
  graphRef: string;
}>;

export type IncomingMessageEvent =
  | ExplorerRequest
  | ExplorerSubscriptionRequest
  | ExplorerSubscriptionTermination
  | ExplorerListening
  | ExplorerListeningForPartialToken
  | ExplorerIntrospectionQueryWithHeaders
  | SetPartialAuthenticationTokenForParent;

export const postMessageToEmbed = ({
  embeddedExplorerIFrame,
  message,
}: {
  embeddedExplorerIFrame: HTMLIFrameElement;
  message: OutgoingMessageEvent;
}): void => {
  embeddedExplorerIFrame.contentWindow?.postMessage(
    message,
    EMBEDDABLE_EXPLORER_URL
  );
};

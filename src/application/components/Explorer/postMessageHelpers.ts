import type { GraphQLError, IntrospectionQuery } from "graphql";

export type JSONPrimitive = boolean | null | string | number;
export type JSONObject = { [key in string]?: JSONValue };
export type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;

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

export type ExplorerResponse = {
  data?: JSONValue | undefined;
  errors?: readonly GraphQLError[] | undefined;
  error?:
    | {
        message: string;
        stack?: string;
      }
    | undefined;
  status?: number;
  headers?: Record<string, string>;
};

export type OutgoingMessageEvent =
  | {
      name: "SchemaError";
      error?: string;
      errors?: readonly GraphQLError[] | undefined;
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
  variables: JSONValue;
  operationName?: string;
  headers: Record<string, string>;
  sandboxEndpointUrl?: string;
}>;

export type ExplorerSubscriptionRequest = MessageEvent<{
  name: "ExplorerSubscriptionRequest";
  operationId: string;
  operation: string;
  variables: JSONValue;
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

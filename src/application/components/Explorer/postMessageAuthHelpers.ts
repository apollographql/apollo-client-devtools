import { IncomingMessageEvent, postMessageToEmbed } from "./postMessageHelpers";

export const SET_PARTIAL_AUTHENTICATION_TOKEN_FOR_PARENT =
  "SetPartialAuthenticationTokenForParent";
export const EXPLORER_LISTENING_FOR_PARTIAL_TOKEN =
  "ExplorerListeningForPartialToken";
export const PARTIAL_AUTHENTICATION_TOKEN_RESPONSE =
  "PartialAuthenticationTokenResponse";

export const hasGraphRefBeenAuthenticated = (graphRef: string): boolean => {
  const partialEmbedApiKeysString = window.localStorage.getItem(
    "apolloStudioEmbeddedExplorerEncodedApiKey"
  );
  const partialEmbedApiKeys = partialEmbedApiKeysString
    ? JSON.parse(partialEmbedApiKeysString)
    : {};
  return Object.keys(partialEmbedApiKeys).some((key) => {
    const splitKey = key.split(":");
    const keyGraphRef = splitKey[splitKey.length - 1];
    return keyGraphRef === graphRef;
  });
};

export const handleAuthenticationPostMessage = ({
  event,
  embeddedExplorerIFrame,
  setGraphRef,
  closeGraphRefModal,
  onAuthHandshakeReceived,
}: {
  event: IncomingMessageEvent;
  embeddedExplorerIFrame: HTMLIFrameElement;
  setGraphRef: (graphRef: string) => void;
  closeGraphRefModal: () => void;
  onAuthHandshakeReceived: () => void;
}): void => {
  const { data } = event;
  // When the embed authenticates, save the partial token in local storage
  if (data.name === SET_PARTIAL_AUTHENTICATION_TOKEN_FOR_PARENT) {
    const partialEmbedApiKeysString = window.localStorage.getItem(
      "apolloStudioEmbeddedExplorerEncodedApiKey"
    );
    const partialEmbedApiKeys = partialEmbedApiKeysString
      ? JSON.parse(partialEmbedApiKeysString)
      : {};
    partialEmbedApiKeys[data.localStorageKey] = data.partialToken;
    window.localStorage.setItem(
      "apolloStudioEmbeddedExplorerEncodedApiKey",
      JSON.stringify(partialEmbedApiKeys)
    );
    setGraphRef(data.graphRef);
    closeGraphRefModal();
  }

  if (
    data.name === EXPLORER_LISTENING_FOR_PARTIAL_TOKEN &&
    data.localStorageKey
  ) {
    const partialEmbedApiKeysString = window.localStorage.getItem(
      "apolloStudioEmbeddedExplorerEncodedApiKey"
    );
    const partialEmbedApiKeys = partialEmbedApiKeysString
      ? JSON.parse(partialEmbedApiKeysString)
      : {};
    if (partialEmbedApiKeys && partialEmbedApiKeys[data.localStorageKey]) {
      onAuthHandshakeReceived();
      postMessageToEmbed({
        embeddedExplorerIFrame,
        message: {
          name: PARTIAL_AUTHENTICATION_TOKEN_RESPONSE,
          partialToken: partialEmbedApiKeys[data.localStorageKey],
        },
      });
    }
  }
};

export const EXPLORER_LISTENING_FOR_HANDSHAKE = "ExplorerListeningForHandshake";
export const HANDSHAKE_RESPONSE = "HandshakeResponse";

export const sendHandshakeToEmbed = ({
  graphRef,
  embeddedExplorerIFrame,
}: {
  graphRef: string | undefined;
  embeddedExplorerIFrame: HTMLIFrameElement;
}): void => {
  postMessageToEmbed({
    message: {
      name: HANDSHAKE_RESPONSE,
      graphRef,
    },
    embeddedExplorerIFrame,
  });
};

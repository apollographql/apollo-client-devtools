import React, { useRef } from "react";
import { screen } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { Explorer } from "../Explorer";

// Required to prevent an error in CodeMirror
document.createRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn(),
    };
  };

  return range;
};

const EmbeddedExplorerWrapper = () => {
  const explorerRef = useRef<Explorer.Ref>(null);
  return <Explorer clientId="1" isVisible={true} explorerRef={explorerRef} />;
};

describe("<Explorer />", () => {
  test("it renders load from cache checkbox", () => {
    renderWithApolloClient(<EmbeddedExplorerWrapper />);

    expect(screen.getByLabelText("Load from cache")).toBeInTheDocument();
  });

  test("it renders the Explorer iframe", () => {
    renderWithApolloClient(<EmbeddedExplorerWrapper />);
    const iframe = document.getElementById(
      "embedded-explorer"
    ) as HTMLIFrameElement;
    expect(iframe).toBeTruthy();
    expect(iframe.src).toEqual(
      "https://explorer.embed.apollographql.com/?sendRequestsFrom=parent&shouldPersistState=false&showHeadersAndEnvVars=false&shouldShowGlobalHeader=false&parentSupportsSubscriptions=true&theme=light"
    );
  });
});

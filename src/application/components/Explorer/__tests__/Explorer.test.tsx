import React, { useState } from "react";
import { within, screen } from "@testing-library/react";
import { graphql } from "graphql";
import { getIntrospectionQuery } from "graphql/utilities";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { schemaWithMocks } from "../../../utilities/testing/fakeGraphQL";
import { Explorer } from "../Explorer";
import { listenForResponse } from "../explorerRelay";

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

jest.mock("../explorerRelay", () => ({
  sendExplorerRequest: jest.fn(),
  listenForResponse: jest.fn(),
}));

const EmbeddedExplorerWrapper = () => {
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] =
    useState<HTMLIFrameElement | null>(null);
  return (
    <Explorer
      isVisible={true}
      embeddedExplorerProps={{
        embeddedExplorerIFrame,
        setEmbeddedExplorerIFrame,
      }}
    />
  );
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

  // TODO: This test does nothing but stub an implementation of a function.
  // Disabling until we can make it useful
  test.skip("it retrieves a schema from an IntrospectionQuery", async () => {
    (listenForResponse as any).mockImplementation(
      (_: unknown, cb: (result: unknown) => void) => {
        graphql({
          schema: schemaWithMocks,
          source: getIntrospectionQuery(),
        }).then((result) => cb(result));
      }
    );
  });
});

import React, { useState } from "react";
import { within } from "@testing-library/react";
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
  receiveExplorerResponses: jest.fn(),
  listenForResponse: jest.fn(),
}));

const EmbeddedExplorerWrapper = () => {
  const navigationProps = { queriesCount: 0, mutationsCount: 0 };
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] =
    useState<HTMLIFrameElement | null>(null);
  return (
    <Explorer
      isVisible={true}
      navigationProps={navigationProps}
      embeddedExplorerProps={{
        embeddedExplorerIFrame,
        setEmbeddedExplorerIFrame,
      }}
    />
  );
};

describe("<Explorer />", () => {
  test("it renders a header", () => {
    const { getByTestId } = renderWithApolloClient(<EmbeddedExplorerWrapper />);
    const header = getByTestId("header");
    const { getByLabelText } = within(header);

    expect(header).toBeInTheDocument();
    expect(getByLabelText("Load from cache")).toBeInTheDocument();
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

  test("it retrieves a schema from an IntrospectionQuery", async () => {
    (listenForResponse as any).mockImplementation((_, cb) => {
      graphql({
        schema: schemaWithMocks,
        source: getIntrospectionQuery(),
      }).then((result) => cb(result));
    });
  });
});

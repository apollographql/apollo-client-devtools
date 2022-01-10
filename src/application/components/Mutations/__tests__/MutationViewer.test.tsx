import React from "react";
import user from "@testing-library/user-event";
import stringifyObject from "stringify-object";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { MutationViewer } from "../MutationViewer";

describe("<MutationViewer />", () => {
  beforeEach(() => {
    window.prompt = jest.fn();
  });

  const props = {
    mutationString: `
      mutation AddColorToFavorites($color: ColorInput!) {
        addColor(color: $color) {
          ...colorFields
        }
      }
      fragment colorFields on Color {
        name
        hex
        contrast
      }
    `,
    variables: {
      name: "Violet",
      hex: "#15572C",
      contrast: "#ffffff",
    },
  };

  test("renders the mutation string", () => {
    const { getByText, getAllByText } = renderWithApolloClient(
      <MutationViewer {...props} />
    );

    expect(getByText("Mutation String")).toBeInTheDocument();
    expect(getByText("AddColorToFavorites")).toBeInTheDocument();
    expect(getAllByText("colorFields").length).toEqual(2);
  });

  test("can copy the mutation string", () => {
    const { getByTestId } = renderWithApolloClient(
      <MutationViewer {...props} />
    );

    const copyButton = getByTestId("copy-mutation-string");
    user.click(copyButton);
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      props.mutationString
    );
  });

  test("renders the mutation variables", () => {
    const { getByText } = renderWithApolloClient(<MutationViewer {...props} />);

    expect(getByText("Variables")).toBeInTheDocument();
    expect(
      getByText((content) => content.includes(props.variables.name))
    ).toBeInTheDocument();
  });

  test("can copy the mutation variables", () => {
    const { getByTestId } = renderWithApolloClient(
      <MutationViewer {...props} />
    );

    const copyButton = getByTestId("copy-mutation-variables");
    user.click(copyButton);
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(props.variables)
    );
  });
});

import React from "react";
import { screen } from "@testing-library/react";

import { renderWithApolloClient } from "../../../utilities/testing/renderWithApolloClient";
import { MutationViewer } from "../MutationViewer";

describe("<MutationViewer />", () => {
  beforeEach(() => {
    window.prompt = jest.fn();
  });

  const props = {
    mutation: {
      __typename: "WatchedMutation" as const,
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
    },
  };

  test("renders the mutation string", () => {
    renderWithApolloClient(<MutationViewer {...props} />);

    expect(screen.getByText("Mutation String")).toBeInTheDocument();
    expect(screen.getByText("AddColorToFavorites")).toBeInTheDocument();
    expect(screen.getAllByText("colorFields").length).toEqual(2);
  });

  test("can copy the mutation string", async () => {
    const { user } = renderWithApolloClient(<MutationViewer {...props} />);

    const copyButton = screen.getByTestId("copy-mutation-string");
    await user.click(copyButton);
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      props.mutation.mutationString
    );
  });

  test("renders the mutation variables", () => {
    renderWithApolloClient(<MutationViewer {...props} />);

    expect(screen.getByText("Variables")).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes(props.mutation.variables.name)
      )
    ).toBeInTheDocument();
  });

  test("can copy the mutation variables", async () => {
    const { user } = renderWithApolloClient(<MutationViewer {...props} />);

    const copyButton = screen.getByTestId("copy-mutation-variables");
    await user.click(copyButton);
    expect(window.prompt).toBeCalledWith(
      "Copy to clipboard: Ctrl+C, Enter",
      JSON.stringify(props.mutation.variables)
    );
  });
});

import { gql } from "@apollo/client";
import { COLOR_FIELDS } from "./queries";

export const ADD_COLOR_TO_FAVORITES = gql`
  mutation AddColorToFavorites($color: ColorInput!) {
    addColor(color: $color) {
      ...colorFields
    }
  }

  ${COLOR_FIELDS}
`;

export const REMOVE_COLOR_FROM_FAVORITES = gql`
  mutation RemoveColorFromFavorites($color: ColorInput!) {
    removeColor(color: $color) {
      ...colorFields
    }
  }

  ${COLOR_FIELDS}
`;

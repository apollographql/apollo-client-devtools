import { gql } from "@apollo/client";

export const COLOR_FIELDS = gql`
  fragment colorFields on Color {
    name
    hex
    contrast
  }
`;

export const GET_RANDOM_COLOR = gql`
  query GetRandomColor {
    random {
      color {
        ...colorFields
        saved @client
      }
    }
  }

  ${COLOR_FIELDS}
`;

export const GET_RANDOM_SCHEME = gql`
  query GetRandomScheme {
    random {
      scheme {
        result
      }
    }
  }
`;

export const GET_COLOR = gql`
  query GetColor($hex: String) {
    color(hex: $hex) {
      ...colorFields
      saved @client
    }
  }

  ${COLOR_FIELDS}
`;

export const GET_COLOR_SCHEME = gql`
  query GetColorScheme($hex: String, $mode: Mode, $count: Int) {
    scheme(hex: $hex, mode: $mode, count: $count) {
      mode
      count
      colors {
        ...colorFields
        saved @client
      }
    }
  }

  ${COLOR_FIELDS}
`;

export const GET_SAVED_COLORS = gql`
  query GetSavedColors {
    favoritedColors {
      ...colorFields
    }
  }

  ${COLOR_FIELDS}
`;

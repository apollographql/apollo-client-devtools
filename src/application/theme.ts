import { lighten } from "polished";
import { colors } from "@apollo/space-kit/colors";

export enum ColorTheme {
  Light = 'light',
  Dark = 'dark'
}

const shared = {
  sidebarSelected: colors.indigo.base,
};

export const themes: Record<ColorTheme, Record<string, string>> = {
  [ColorTheme.Light]: {
    primary: colors.indigo.darkest,
    sidebarHover: lighten(0.2, colors.indigo.darkest),
    ...shared,
  },
  [ColorTheme.Dark]: {
    primary: colors.black.base,
    sidebarHover: lighten(0.2, colors.black.base),
    ...shared,
  },
};
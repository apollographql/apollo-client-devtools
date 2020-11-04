import { lighten } from "polished";
import { colors, ShadedColor } from "@apollo/space-kit/colors";

export enum ColorTheme {
  Light = 'light',
  Dark = 'dark'
}

const shared = {
  sidebarSelected: colors.indigo.base,
};

export const themes: Record<ColorTheme, Record<string, ShadedColor>> = {
  [ColorTheme.Light]: {
    primary: colors.indigo.darkest,
    sidebarHover: lighten(0.2, colors.indigo.darkest) as ShadedColor,
    ...shared,
  },
  [ColorTheme.Dark]: {
    primary: colors.black.base,
    sidebarHover: lighten(0.2, colors.black.base) as ShadedColor,
    ...shared,
  },
};

export type Theme = (typeof themes)[keyof typeof themes];
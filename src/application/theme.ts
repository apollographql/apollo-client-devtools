import { lighten } from "polished";
import { colors, ShadedColor } from "@apollo/space-kit/colors";

export enum ColorTheme {
  Light = 'light',
  Dark = 'dark'
}

const shared = {
  sidebarSelected: colors.blilet.base,
};

export const themes: Record<ColorTheme, Record<string, ShadedColor>> = {
  [ColorTheme.Light]: {
    primary: colors.blilet.darker,
    sidebarHover: colors.blilet.darkest,
    ...shared,
  },
  [ColorTheme.Dark]: {
    primary: colors.black.base,
    sidebarHover: colors.midnight.darker,
    ...shared,
  },
};

export type Theme = (typeof themes)[keyof typeof themes];
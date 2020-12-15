import { rgba } from "polished";
import { colors, ShadedColor } from "@apollo/space-kit/colors";

export enum ColorTheme {
  Light = 'light',
  Dark = 'dark'
}

export enum Mode {
  Light = '(prefers-color-scheme: light)',
  Dark = '(prefers-color-scheme: dark)'
}

export function getPreferredTheme(): ColorTheme {
  if (window.matchMedia(Mode.Dark).matches) {
    return ColorTheme.Dark;
  }

  return ColorTheme.Light;
}

export function listenForThemeChange(callback: (colorTheme: ColorTheme) => void) {
  const checkMediaQuery = (event: MediaQueryListEvent): ColorTheme => {
    if (event.matches) {
      return ColorTheme.Dark;
    } 

    return ColorTheme.Light;
  };

  const cb = (event: MediaQueryListEvent) => callback(checkMediaQuery(event));
  window.matchMedia(Mode.Dark).addEventListener('change', cb);

  return () => window.matchMedia(Mode.Dark).removeEventListener('change', cb);
}

// The Base16 options used below are explained here:
// https://github.com/chriskempson/base16/blob/7fa89d33bc77a43e1cf93c4654b235e21f827ce3/styling.md
export const treeTheme = {
  scheme: "apollo",
  author: "Apollo (community@apollographql.com)",
  base00: "#FFFFFF",
  base01: "#FFFFFF",
  base02: "#FFFF00",
  base03: "#969896",
  base04: "#FFFFFF",
  base05: "#FFFFFF",
  base06: "#FFFFFF",
  base07: "#FFFFFF",
  base08: "#D13B3B",
  base09: "#D13B3B",
  base0A: "#191C23",
  base0B: "#D13B3B",
  base0C: "#191C23",
  base0D: "#191C23",
  base0E: "#191C23",
  base0F: "#191C23",
};

const shared = {
  sidebarSelected: colors.blilet.base,
  whiteTransparent: rgba(colors.white, 0.5) as ShadedColor,
};

export const themes: Record<ColorTheme, Record<string, ShadedColor>> = {
  [ColorTheme.Light]: {
    primary: colors.blilet.darker,
    sidebarHover: colors.blilet.darkest,
    ...shared,
  },
  [ColorTheme.Dark]: {
    primary: colors.black.dark,
    sidebarHover: rgba(colors.grey.dark, 0.4) as ShadedColor,
    ...shared,
  },
};

export type Theme = (typeof themes)[keyof typeof themes];

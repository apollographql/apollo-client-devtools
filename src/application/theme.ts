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
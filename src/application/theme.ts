import { rgba } from "polished";
import { makeVar, useReactiveVar } from "@apollo/client";
import { colors, ShadedColor } from "@apollo/space-kit/colors";

export enum ColorTheme {
  Light = "light",
  Dark = "dark",
}

export enum Mode {
  Light = "(prefers-color-scheme: light)",
  Dark = "(prefers-color-scheme: dark)",
}

export function getPreferredTheme(): ColorTheme {
  if (window.matchMedia(Mode.Dark).matches) {
    return ColorTheme.Dark;
  }

  return ColorTheme.Light;
}

export function listenForThemeChange(
  callback: (colorTheme: ColorTheme) => void
) {
  const checkMediaQuery = (event: MediaQueryListEvent): ColorTheme => {
    if (event.matches) {
      return ColorTheme.Dark;
    }

    return ColorTheme.Light;
  };

  const cb = (event: MediaQueryListEvent) => callback(checkMediaQuery(event));
  window.matchMedia(Mode.Dark).addEventListener("change", cb);

  return () => window.matchMedia(Mode.Dark).removeEventListener("change", cb);
}

const shared = {
  sidebarSelected: colors.blilet.base,
  whiteTransparent: rgba(colors.white, 0.5) as ShadedColor,
};

export const themes: Record<ColorTheme, Record<string, ShadedColor>> = {
  [ColorTheme.Light]: {
    primary: colors.blilet.darker,
    main: colors.white as ShadedColor,
    sidebarHover: colors.blilet.darkest,
    mainBorder: colors.silver.darker,
    textPrimary: colors.black.base,
    ...shared,
  },
  [ColorTheme.Dark]: {
    primary: "#1a1c22" as ShadedColor,
    main: "#23262d" as ShadedColor,
    sidebarHover: rgba(colors.grey.dark, 0.4) as ShadedColor,
    mainBorder: colors.black.lighter,
    textPrimary: colors.white as ShadedColor,
    ...shared,
  },
};

export type Theme = (typeof themes)[keyof typeof themes];
export const colorTheme = makeVar<ColorTheme>(getPreferredTheme());
export const isDarkMode = (theme: ColorTheme): boolean => {
  return theme === ColorTheme.Dark;
};

export const useTheme = (): Theme => {
  const theme = useReactiveVar(colorTheme);
  return themes[theme];
};

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

// The Base16 options used below are explained here:
// https://github.com/chriskempson/base16/blob/7fa89d33bc77a43e1cf93c4654b235e21f827ce3/styling.md
export const treeTheme: Record<ColorTheme, Record<string, ShadedColor>> = {
  [ColorTheme.Light]: {
    base00: colors.white as ShadedColor,
    base01: colors.white as ShadedColor,
    base02: "#FFFF00" as ShadedColor,
    base03: "#969896" as ShadedColor,
    base04: colors.white as ShadedColor,
    base05: colors.white as ShadedColor,
    base06: colors.white as ShadedColor,
    base07: colors.white as ShadedColor,
    base08: colors.grey.base,
    base09: colors.indigo.base,
    base0A: colors.black.base,
    base0B: colors.pink.dark,
    base0C: colors.black.base,
    base0D: colors.black.base,
    base0E: colors.black.base,
    base0F: colors.black.base,
  },
  [ColorTheme.Dark]: {
    base00: themes[ColorTheme.Dark].main,
    base01: colors.white as ShadedColor,
    base02: "#FFFF00" as ShadedColor,
    base03: "#969896" as ShadedColor,
    base04: colors.white as ShadedColor,
    base05: colors.white as ShadedColor,
    base06: colors.white as ShadedColor,
    base07: colors.white as ShadedColor,
    base08: colors.grey.base,
    base09: colors.indigo.light,
    base0A: colors.white as ShadedColor,
    base0B: colors.pink.light,
    base0C: colors.white as ShadedColor,
    base0D: colors.white as ShadedColor,
    base0E: colors.white as ShadedColor,
    base0F: colors.white as ShadedColor,
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

export const useTreeTheme = () => {
  const theme = useReactiveVar(colorTheme);

  return {
    scheme: "apollo",
    author: "Apollo (community@apollographql.com)",
    ...treeTheme[theme],
  };
};

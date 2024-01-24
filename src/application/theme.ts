import { makeVar } from "@apollo/client";

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

export const colorTheme = makeVar<ColorTheme>(getPreferredTheme());

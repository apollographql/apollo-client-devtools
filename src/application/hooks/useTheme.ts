import { useReactiveVar } from "@apollo/client/react";
import { ColorTheme, colorTheme } from "../theme";
import { useMemo } from "react";

export function useThemeKey() {
  return useReactiveVar(colorTheme) === ColorTheme.Dark ? "dark" : "base";
}

export function useThemeObject(
  theme: Record<string, { base: string; dark: string }>
) {
  const colorKey = useThemeKey();

  return useMemo(() => {
    return Object.fromEntries(
      Object.entries(theme).map(([key, colorValue]) => [
        key,
        colorValue[colorKey],
      ])
    );
  }, [colorKey, theme]);
}

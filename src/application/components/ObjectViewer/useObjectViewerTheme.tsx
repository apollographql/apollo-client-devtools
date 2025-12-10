import { useThemeKey, useThemeObject } from "@/application/hooks/useTheme";
import { useCallback, useMemo } from "react";

type ThemeKey =
  | "arrow"
  | "arrayIndex"
  | "brace"
  | "bracket"
  | "constructorName"
  | "ellipsis"
  | "indentGuide"
  | "info"
  | "punctuation"
  | "quote"
  | "objectKey"
  | "typeBigint"
  | "typeBoolean"
  | "typeInt"
  | "typeFloat"
  | "typeFunction"
  | "typeNaN"
  | "typeNumber"
  | "typeNull"
  | "typeString"
  | "typeSymbol"
  | "typeUndefined"
  | "sparseArrayEmptyItem";

export type ColorValue = { base: string; dark: string };
export type Theme = Partial<Record<ThemeKey, ColorValue>>;

export function useObjectViewerTheme(theme: Theme) {
  const themeObject = useThemeObject(theme);

  return useMemo(() => {
    return Object.fromEntries(
      Object.entries(themeObject).map(([key, value]) => [
        `--ov-${key}-color`,
        value,
      ])
    );
  }, [themeObject]);
}

export function useGetObjectViewerThemeOverride() {
  const colorKey = useThemeKey();

  return useCallback(
    (overrides: Theme) => {
      return Object.fromEntries(
        Object.entries(overrides)
          .filter(([, value]) => value)
          .map(([key, value]) => [`--ov-${key}-color`, value[colorKey]])
      );
    },
    [colorKey]
  );
}

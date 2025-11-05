import { useThemeKey, useThemeObject } from "@/application/hooks/useTheme";
import { useCallback, useMemo } from "react";

type ThemeKey =
  | "arrayIndex"
  | "bracket"
  | "constructorName"
  | "ellipsis"
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
  | "typeUndefined";

export type Theme = Partial<Record<ThemeKey, { base: string; dark: string }>>;

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

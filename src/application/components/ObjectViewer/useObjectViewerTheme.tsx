import { useThemeObject } from "@/application/hooks/useTheme";
import { useMemo } from "react";

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

export type Theme = Record<ThemeKey, { base: string; dark: string }>;

export function useObjectViewerTheme(theme: Partial<Theme>) {
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

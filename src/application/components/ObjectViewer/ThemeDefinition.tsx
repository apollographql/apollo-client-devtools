import { useThemeObject } from "@/application/hooks/useTheme";
import type { ReactNode } from "react";
import { useMemo } from "react";

interface Props {
  as?: "span" | "div";
  children?: ReactNode;
  className?: string;
  theme: Theme;
}

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

export function ThemeDefinition({
  as: Element = "div",
  className,
  children,
  theme,
}: Props) {
  const themeObject = useThemeObject(theme);

  const themeValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(themeObject).map(([key, value]) => [
        `--ov-${key}-color`,
        value,
      ])
    );
  }, [themeObject]);

  return (
    <Element style={themeValues} className={className}>
      {children}
    </Element>
  );
}

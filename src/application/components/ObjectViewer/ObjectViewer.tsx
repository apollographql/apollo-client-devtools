import { useReactiveVar } from "@apollo/client/react";
import { ValueNode } from "./ValueNode";
import { colors } from "@apollo/brand";
import { ColorTheme, colorTheme } from "@/application/theme";

interface Props {
  theme?: Theme;
  value: unknown;
}

type ColorTokens = typeof colors.tokens;

type ColorValue = {
  [Category in keyof ColorTokens]: `${Category}.${keyof ColorTokens[Category] extends string ? keyof ColorTokens[Category] : never}`;
}[keyof ColorTokens];

type ThemeKey =
  | "arrayIndex"
  | "brace"
  | "bracket"
  | "constructorName"
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

export type Theme = Partial<Record<ThemeKey, ColorValue>>;

export function ObjectViewer({ value, theme = {} }: Props) {
  const colorKey =
    useReactiveVar(colorTheme) === ColorTheme.Dark ? "dark" : "base";

  const themeValues = Object.fromEntries(
    Object.entries(theme).map(([key, value]) => {
      const [category, token] = value.split(".") as [
        keyof ColorTokens,
        keyof ColorTokens[keyof ColorTokens],
      ];

      return [`--ov-${key}-color`, colors.tokens[category][token][colorKey]];
    })
  );

  return (
    <div style={themeValues} className="font-code">
      <ValueNode depth={0} value={value} />
    </div>
  );
}

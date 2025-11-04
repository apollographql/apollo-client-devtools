import { ValueNode } from "./ValueNode";
import { colors } from "@apollo/brand";
import { useThemeObject } from "@/application/hooks/useTheme";
import { useMemo } from "react";

interface Props {
  value: unknown;
}

type ThemeKey =
  | "arrayIndex"
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

type Theme = Partial<Record<ThemeKey, { base: string; dark: string }>>;

const { code, text } = colors.tokens;

const theme: Theme = {
  constructorName: code.e,
  info: code.g,
  punctuation: code.a,
  objectKey: code.d,
  typeBoolean: code.c,
  typeFunction: code.f,
  typeNumber: code.c,
  typeNull: text.secondary,
  typeString: code.g,
  typeSymbol: code.e,
  typeUndefined: text.secondary,
};

export function ObjectViewer({ value }: Props) {
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
    <div style={themeValues} className="font-code">
      <ValueNode depth={0} value={value} />
    </div>
  );
}

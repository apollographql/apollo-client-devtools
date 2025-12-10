import { colors } from "@apollo/brand";
import type { Theme } from "./useObjectViewerTheme";

const { border, code, icon, text } = colors.tokens;

export const defaultTheme: Theme = {
  arrow: icon.primary,
  constructorName: code.e,
  ellipsis: text.secondary,
  indentGuide: border.primary,
  info: code.e,
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

export const alertErrorTheme: Theme = {
  indentGuide: { base: "transparent", dark: "transparent" },
  objectKey: text.error,
};

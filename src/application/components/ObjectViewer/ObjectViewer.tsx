import { ValueNode } from "./ValueNode";
import { colors } from "@apollo/brand";
import { useThemeObject } from "@/application/hooks/useTheme";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Provider } from "./context";

export type Renderer<T = unknown> = {
  is: (value: unknown) => value is T;
  expandable?: boolean | ((value: unknown) => boolean);
  render: React.FC<CustomRenderProps<T>>;
};

export interface CustomRenderProps<T = unknown> {
  value: T;
  renderDefault: (value: unknown) => ReactNode;
}

interface Props {
  value: unknown;
  renderers: Record<string, Renderer<any>>;
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

type Theme = Partial<Record<ThemeKey, { base: string; dark: string }>>;

const { code, text } = colors.tokens;

const theme: Theme = {
  constructorName: code.e,
  ellipsis: text.secondary,
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

export function ObjectViewer({ renderers, value }: Props) {
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
      <Provider renderers={renderers}>
        <ValueNode depth={0} value={value} />
      </Provider>
    </div>
  );
}

import { ValueNode } from "./ValueNode";
import { colors } from "@apollo/brand";
import { Provider } from "./context";
import type { Theme } from "./ThemeDefinition";
import { ThemeDefinition } from "./ThemeDefinition";

export type Renderer<T = unknown> = {
  is: (value: unknown) => value is T;
  expandable?: boolean | ((value: unknown) => boolean);
  render: React.FC<CustomRenderProps<T>>;
};

export interface CustomRenderProps<T = unknown> {
  value: T;
  DefaultRender: React.FC<{ className?: string; value: unknown }>;
}

interface Props {
  value: unknown;
  renderers: Record<string, Renderer<any>>;
}

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
  return (
    <ThemeDefinition theme={theme} className="font-code">
      <Provider renderers={renderers}>
        <ValueNode depth={0} value={value} />
      </Provider>
    </ThemeDefinition>
  );
}

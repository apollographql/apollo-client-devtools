/* eslint-disable @typescript-eslint/ban-types */
import { ValueNode } from "./ValueNode";
import { colors } from "@apollo/brand";
import { Provider } from "./context";
import type { Theme } from "./ThemeDefinition";
import { ThemeDefinition } from "./ThemeDefinition";
import type { ReactNode } from "react";

export type RenderType<Value = unknown, DefaultValue = unknown> = (
  props: CustomRenderProps<Value, DefaultValue>
) => ReactNode;

export type BuiltinRenderType<T = unknown> = (
  props: CustomRenderProps<T, T>
) => ReactNode;

type ValueProps<T> = [T] extends [never] ? { value?: never } : { value: T };

export type CustomRenderProps<Value = unknown, DefaultValue = unknown> = {
  className?: string;
  context?: Record<string, any>;
  depth: number;
  DefaultRender: (props: {
    context?: Record<string, any>;
    className?: string;
    value: DefaultValue;
  }) => ReactNode;
} & ValueProps<Value>;

type CustomTypeRenderers<CustomTypes extends string> = {
  [Type in CustomTypes]: RenderType<any>;
};

interface BuiltinTypeRenderers {
  array: BuiltinRenderType<unknown[]>;
  bigint: BuiltinRenderType<bigint>;
  boolean: BuiltinRenderType<boolean>;
  function: BuiltinRenderType<Function>;
  object: BuiltinRenderType<object>;
  string: BuiltinRenderType<string>;
  symbol: BuiltinRenderType<symbol>;
  number: BuiltinRenderType<number>;
  undefined: BuiltinRenderType<never>;
  null: BuiltinRenderType<never>;
}

interface Props<CustomTypes extends string> {
  value: unknown;
  getTypeOf?: (value: unknown) => CustomTypes | undefined;
  customTypeRenderers: CustomTypeRenderers<CustomTypes>;
  builtinTypeRenderers: Partial<BuiltinTypeRenderers>;
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

export function ObjectViewer<CustomTypes extends string>({
  getTypeOf,
  builtinTypeRenderers,
  customTypeRenderers,
  value,
}: Props<CustomTypes>) {
  return (
    <ThemeDefinition theme={theme} className="font-code">
      <Provider
        getTypeOf={getTypeOf}
        renderers={{ ...builtinTypeRenderers, ...customTypeRenderers } as any}
      >
        <ValueNode context={{}} depth={0} value={value} />
      </Provider>
    </ThemeDefinition>
  );
}

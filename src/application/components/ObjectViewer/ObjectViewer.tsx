/* eslint-disable @typescript-eslint/ban-types */
import { ValueNode } from "./ValueNode";
import { colors } from "@apollo/brand";
import { Provider } from "./context";
import type { Theme } from "./ThemeDefinition";
import { ThemeDefinition } from "./ThemeDefinition";
import type { ReactNode } from "react";
import type { ObjectPair } from "./ObjectPair";
import type { ArrayItem } from "./ArrayItem";
import type { WithDefaultRender } from "./CustomRenderable";

export type BuiltinRenderType<T = unknown> = (
  props: CustomRenderProps<T, T>
) => ReactNode;

type ValueProp<T> = [T] extends [never] ? { value?: never } : { value: T };

export type RenderableTypeProps<T = unknown> = {
  className?: string;
  depth: number;
  context: Record<string, any> | undefined;
} & ValueProp<T>;

export type CustomRenderProps<
  T = unknown,
  DefaultValue = unknown,
> = RenderableTypeProps<T> & {
  DefaultRender: (
    props: Partial<Omit<RenderableTypeProps<DefaultValue>, "depth">>
  ) => ReactNode;
};

type CustomTypeRenderers<CustomTypes extends string> = {
  [Type in CustomTypes]: (props: CustomRenderProps<any>) => ReactNode;
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

interface CustomComponents {
  arrayItem: WithDefaultRender<typeof ArrayItem>;
  objectPair: WithDefaultRender<typeof ObjectPair>;
}

interface Props<CustomTypes extends string> {
  value: unknown;
  getTypeOf?: (value: unknown) => CustomTypes | undefined;
  customComponents?: Partial<CustomComponents>;
  customTypeRenderers?: CustomTypeRenderers<CustomTypes>;
  builtinTypeRenderers?: Partial<BuiltinTypeRenderers>;
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
  customComponents,
  builtinTypeRenderers,
  customTypeRenderers,
  value,
}: Props<CustomTypes>) {
  return (
    <ThemeDefinition theme={theme} className="font-code">
      <Provider
        getTypeOf={getTypeOf}
        renderers={
          {
            ...builtinTypeRenderers,
            ...customTypeRenderers,
            ...customComponents,
          } as any
        }
      >
        <ValueNode context={{}} depth={0} value={value} />
      </Provider>
    </ThemeDefinition>
  );
}

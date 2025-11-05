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
import type { ArrayNode } from "./ArrayNode";
import type { BigintNode } from "./BigintNode";
import type { BooleanNode } from "./BooleanNode";
import type { FunctionNode } from "./FunctionNode";
import type { ObjectNode } from "./ObjectNode";
import type { StringNode } from "./StringNode";
import type { SymbolNode } from "./SymbolNode";
import type { NumberNode } from "./NumberNode";
import type { UndefinedNode } from "./UndefinedNode";
import type { NullNode } from "./NullNode";

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

interface BuiltinRenderers {
  array: WithDefaultRender<typeof ArrayNode>;
  arrayItem: WithDefaultRender<typeof ArrayItem>;
  bigint: WithDefaultRender<typeof BigintNode>;
  boolean: WithDefaultRender<typeof BooleanNode>;
  function: WithDefaultRender<typeof FunctionNode>;
  object: WithDefaultRender<typeof ObjectNode>;
  objectPair: WithDefaultRender<typeof ObjectPair>;
  string: WithDefaultRender<typeof StringNode>;
  symbol: WithDefaultRender<typeof SymbolNode>;
  number: WithDefaultRender<typeof NumberNode>;
  undefined: WithDefaultRender<typeof UndefinedNode>;
  null: WithDefaultRender<typeof NullNode>;
}

interface Props<CustomTypes extends string> {
  value: unknown;
  getTypeOf?: (value: unknown) => CustomTypes | undefined;
  customRenderers?: CustomTypeRenderers<CustomTypes>;
  builtinRenderers?: Partial<BuiltinRenderers>;
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
  builtinRenderers,
  customRenderers,
  value,
}: Props<CustomTypes>) {
  return (
    <ThemeDefinition theme={theme} className="font-code">
      <Provider
        getTypeOf={getTypeOf}
        renderers={
          {
            ...builtinRenderers,
            ...customRenderers,
          } as any
        }
      >
        <ValueNode context={{}} depth={0} value={value} />
      </Provider>
    </ThemeDefinition>
  );
}

/* eslint-disable @typescript-eslint/ban-types */
import { ValueNode } from "./ValueNode";
import { colors } from "@apollo/brand";
import { Provider } from "./context";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
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
import type { Path } from "./types";
import type { Theme } from "./useObjectViewerTheme";
import type { ArrayIndex } from "./ArrayIndex";
import type { ObjectKey } from "./ObjectKey";
import type { CollapsedObject } from "./CollapsedObject";
import type { CollapsedArray } from "./CollapsedArray";
import { useObjectViewerTheme } from "./useObjectViewerTheme";
import type { SparseArrayEmptyItem } from "./SparseArrayEmptyItem";

type ValueProp<T> = [T] extends [never] ? { value?: never } : { value: T };

export type RenderableTypeProps<T = unknown> = {
  className?: string;
  depth: number;
  path: Path;
  context: Record<string, any> | undefined;
} & ValueProp<T>;

export type CustomRenderProps<
  T = unknown,
  DefaultValue = unknown,
> = RenderableTypeProps<T> & {
  DefaultRender: (
    props: Partial<Omit<RenderableTypeProps<DefaultValue>, "depth" | "path">>
  ) => ReactNode;
};

export type BuiltinRendererProps<Type extends keyof BuiltinRenderers> =
  ComponentPropsWithoutRef<BuiltinRenderers[Type]>;

interface BuiltinRenderers {
  array: WithDefaultRender<typeof ArrayNode>;
  arrayItem: WithDefaultRender<typeof ArrayItem>;
  arrayIndex: WithDefaultRender<typeof ArrayIndex>;
  bigint: WithDefaultRender<typeof BigintNode>;
  boolean: WithDefaultRender<typeof BooleanNode>;
  collapsedArray: WithDefaultRender<typeof CollapsedArray>;
  collapsedObject: WithDefaultRender<typeof CollapsedObject>;
  function: WithDefaultRender<typeof FunctionNode>;
  object: WithDefaultRender<typeof ObjectNode>;
  objectPair: WithDefaultRender<typeof ObjectPair>;
  objectKey: WithDefaultRender<typeof ObjectKey>;
  sparseArrayEmptyItem: WithDefaultRender<typeof SparseArrayEmptyItem>;
  string: WithDefaultRender<typeof StringNode>;
  symbol: WithDefaultRender<typeof SymbolNode>;
  number: WithDefaultRender<typeof NumberNode>;
  undefined: WithDefaultRender<typeof UndefinedNode>;
  null: WithDefaultRender<typeof NullNode>;
}

const { code, text, icon } = colors.tokens;

const theme: Theme = {
  arrow: icon.primary,
  constructorName: code.e,
  ellipsis: text.secondary,
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

export function ObjectViewer<CustomTypes extends string>({
  getTypeOf,
  builtinRenderers,
  customRenderers,
  value,
}: {
  value: unknown;
  getTypeOf?: (value: unknown) => CustomTypes | undefined;
  customRenderers?: Record<
    NoInfer<CustomTypes>,
    (props: CustomRenderProps<any>) => ReactNode
  >;
  builtinRenderers?: Partial<BuiltinRenderers>;
}) {
  const style = useObjectViewerTheme(theme);

  return (
    <div style={style} className="font-code">
      <Provider
        getTypeOf={getTypeOf}
        renderers={
          {
            ...builtinRenderers,
            ...customRenderers,
          } as any
        }
      >
        <ValueNode context={{}} depth={0} value={value} path={[]} />
      </Provider>
    </div>
  );
}

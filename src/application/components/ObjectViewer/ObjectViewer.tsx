/* eslint-disable @typescript-eslint/ban-types */
import { colors } from "@apollo/brand";
import { Provider } from "./context";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
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
import type { AnyValueNode } from "./AnyValueNode";
import { AnyValue } from "./AnyValue";
import type { ObjType } from "./getTypeOf";
import type { ObjectValueNode } from "./ObjectValueNode";
import type { ArrayValueNode } from "./ArrayValueNode";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";

type ValueProp<T> = [T] extends [never] ? { value?: never } : { value: T };

export type RenderableType = ObjType | (string & {});

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
  anyValue: WithDefaultRender<typeof AnyValueNode>;
  array: WithDefaultRender<typeof ArrayNode>;
  arrayItem: WithDefaultRender<typeof ArrayItem>;
  arrayIndex: WithDefaultRender<typeof ArrayIndex>;
  arrayValue: WithDefaultRender<typeof ArrayValueNode>;
  bigint: WithDefaultRender<typeof BigintNode>;
  boolean: WithDefaultRender<typeof BooleanNode>;
  collapsedArray: WithDefaultRender<typeof CollapsedArray>;
  collapsedObject: WithDefaultRender<typeof CollapsedObject>;
  function: WithDefaultRender<typeof FunctionNode>;
  object: WithDefaultRender<typeof ObjectNode>;
  objectPair: WithDefaultRender<typeof ObjectPair>;
  objectKey: WithDefaultRender<typeof ObjectKey>;
  objectValue: WithDefaultRender<typeof ObjectValueNode>;
  sparseArrayEmptyItem: WithDefaultRender<typeof SparseArrayEmptyItem>;
  string: WithDefaultRender<typeof StringNode>;
  symbol: WithDefaultRender<typeof SymbolNode>;
  number: WithDefaultRender<typeof NumberNode>;
  undefined: WithDefaultRender<typeof UndefinedNode>;
  null: WithDefaultRender<typeof NullNode>;
}

const { border, code, text, icon } = colors.tokens;

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

interface ObjectViewerProps<CustomTypes extends string> {
  value: unknown;
  className?: string;
  displayObjectSize?:
    | number
    | boolean
    | ((options: {
        value: unknown;
        depth: number;
        context: Record<string, any> | undefined;
        defaultDisplayObjectSize: boolean;
        path: Path;
      }) => boolean);
  collapsed?:
    | number
    | boolean
    | ((options: {
        value: unknown;
        depth: number;
        context: Record<string, any> | undefined;
        defaultCollapsed: boolean;
        path: Path;
      }) => boolean);
  getTypeOf?: (value: unknown) => CustomTypes | undefined;
  customRenderers?: Record<
    NoInfer<CustomTypes>,
    (props: CustomRenderProps<any>) => ReactNode
  >;
  builtinRenderers?: Partial<BuiltinRenderers>;
  tagName?: ElementType;
  theme?: Theme;
  size?: "base" | "sm";
}

const objectViewer = cva(["font-code"], {
  variants: {
    size: {
      base: ["[--ov-arrow-size:1rem]"],
      sm: ["text-xs", "[--ov-arrow-size:0.75rem]"],
    },
  },
});

export function ObjectViewer<CustomTypes extends string>({
  className,
  getTypeOf,
  collapsed = 1,
  displayObjectSize = true,
  builtinRenderers,
  customRenderers,
  value,
  tagName: Element = "div",
  theme = defaultTheme,
  size = "base",
}: ObjectViewerProps<CustomTypes>) {
  const style = useObjectViewerTheme({ ...defaultTheme, ...theme });

  return (
    <Element
      style={style}
      className={twMerge(objectViewer({ size }), className)}
    >
      <Provider
        collapsed={collapsed}
        displayObjectSize={displayObjectSize}
        getTypeOf={getTypeOf}
        renderers={
          {
            ...builtinRenderers,
            ...customRenderers,
          } as any
        }
      >
        <AnyValue context={{}} depth={0} value={value} path={[]} />
      </Provider>
    </Element>
  );
}

/* eslint-disable @typescript-eslint/ban-types */
import { BigintNode } from "./BigintNode";
import { BooleanNode } from "./BooleanNode";
import { FunctionNode } from "./FunctionNode";
import { NumberNode } from "./NumberNode";
import { StringNode } from "./StringNode";
import { SymbolNode } from "./SymbolNode";
import { UndefinedNode } from "./UndefinedNode";
import { ObjectNode } from "./ObjectNode";
import { NullNode } from "./NullNode";
import { ArrayNode } from "./ArrayNode";
import { useObjectViewerContext } from "./context";
import { CustomNode } from "./CustomNode";
import type { RenderableTypeProps } from "./ObjectViewer";
import { getTypeOf } from "./getTypeOf";
import { customRenderable } from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";

export const AnyValueNode = (({
  value,
  ...props
}: RenderableTypeProps<unknown>) => {
  const ctx = useObjectViewerContext();
  const type = ctx.getTypeOf?.(value) ?? getTypeOf(value);

  return <AnyValue {...props} type={type} value={value} />;
}) as typeof AnyValue;

interface AnyValueProps
  extends ComponentPropsWithoutRef<"div">,
    RenderableTypeProps<unknown> {
  type: ReturnType<typeof getTypeOf> | (string & {});
}

const AnyValue = customRenderable(
  "anyValue",
  ({ value, type, ...props }: AnyValueProps) => {
    switch (type) {
      case "array":
        return <ArrayNode {...props} value={value as unknown[]} />;
      case "bigint":
        return <BigintNode {...props} value={value as bigint} />;
      case "boolean":
        return <BooleanNode {...props} value={value as boolean} />;
      case "function":
        return <FunctionNode {...props} value={value as Function} />;
      case "number":
        return <NumberNode {...props} value={value as number} />;
      case "null":
        return <NullNode {...props} />;
      case "string":
        return <StringNode {...props} value={value as string} />;
      case "symbol":
        return <SymbolNode {...props} value={value as symbol} />;
      case "undefined":
        return <UndefinedNode {...props} />;
      case "object":
        return <ObjectNode {...props} value={value as object} />;
      default:
        return <CustomNode {...props} type={type} value={value} />;
    }
  }
);

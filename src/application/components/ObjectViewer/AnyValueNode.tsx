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
import { CustomNode } from "./CustomNode";
import type { RenderableType, RenderableTypeProps } from "./ObjectViewer";
import { customRenderable } from "./CustomRenderable";
import type { ComponentPropsWithoutRef } from "react";

interface AnyValueNodeProps
  extends ComponentPropsWithoutRef<"div">,
    RenderableTypeProps<unknown> {
  type: RenderableType;
}

export const AnyValueNode = customRenderable(
  "anyValue",
  ({ value, type, ...props }: AnyValueNodeProps) => {
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

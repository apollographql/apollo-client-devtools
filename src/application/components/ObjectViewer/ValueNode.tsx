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
import { useTypeOfValue } from "./context";
import type { RenderableTypeProps } from "./CustomRenderable";
import { CustomNode } from "./CustomNode";

export const ValueNode = ({
  context,
  className,
  depth,
  value,
}: RenderableTypeProps<unknown>) => {
  const type = useTypeOfValue(value);

  const sharedProps = {
    depth,
    className,
    context,
  };

  switch (type) {
    case "array":
      return <ArrayNode {...sharedProps} value={value as unknown[]} />;
    case "bigint":
      return <BigintNode {...sharedProps} value={value as bigint} />;
    case "boolean":
      return <BooleanNode {...sharedProps} value={value as boolean} />;
    case "function":
      return <FunctionNode {...sharedProps} value={value as Function} />;
    case "number":
      return <NumberNode {...sharedProps} value={value as number} />;
    case "null":
      return <NullNode {...sharedProps} />;
    case "string":
      return <StringNode {...sharedProps} value={value as string} />;
    case "symbol":
      return <SymbolNode {...sharedProps} value={value as symbol} />;
    case "undefined":
      return <UndefinedNode {...sharedProps} />;
    case "object":
      return <ObjectNode {...sharedProps} value={value as object} />;
    default:
      return <CustomNode {...sharedProps} value={value} />;
  }
};

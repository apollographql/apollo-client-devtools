/* eslint-disable testing-library/render-result-naming-convention */
import { ArrayNode } from "./ArrayNode";
import { BigintNode } from "./BigintNode";
import { BooleanNode } from "./BooleanNode";
import { FunctionNode } from "./FunctionNode";
import { NullNode } from "./NullNode";
import { NumberNode } from "./NumberNode";
import { ObjectNode } from "./ObjectNode";
import { StringNode } from "./StringNode";
import { SymbolNode } from "./SymbolNode";
import { UndefinedNode } from "./UndefinedNode";
import { CustomNode } from "./CustomNode";
import { useRenderer } from "./useRenderer";

interface Props {
  className?: string;
  depth: number;
  value: unknown;
}

export function ValueNode({ className, depth, value }: Props) {
  const renderer = useRenderer(value);

  if (renderer) {
    return <CustomNode depth={depth} value={value} renderer={renderer} />;
  }

  switch (typeof value) {
    case "bigint":
      return <BigintNode className={className} value={value} />;
    case "boolean":
      return <BooleanNode className={className} value={value} />;
    case "function":
      return <FunctionNode className={className} value={value} />;
    case "number":
      return <NumberNode className={className} value={value} />;
    case "string":
      return <StringNode className={className} value={value} />;
    case "symbol":
      return <SymbolNode className={className} value={value} />;
    case "undefined":
      return <UndefinedNode className={className} />;
    case "object": {
      if (value === null) {
        return <NullNode className={className} />;
      }

      if (Array.isArray(value)) {
        return <ArrayNode depth={depth} value={value} />;
      }

      return <ObjectNode depth={depth} value={value} />;
    }
  }
}

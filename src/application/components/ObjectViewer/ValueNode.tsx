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

interface Props {
  depth: number;
  value: unknown;
}

export function ValueNode({ depth, value }: Props) {
  switch (typeof value) {
    case "bigint":
      return <BigintNode value={value} />;
    case "boolean":
      return <BooleanNode value={value} />;
    case "function":
      return <FunctionNode value={value} />;
    case "number":
      return <NumberNode value={value} />;
    case "string":
      return <StringNode value={value} />;
    case "symbol":
      return <SymbolNode value={value} />;
    case "undefined":
      return <UndefinedNode />;
    case "object": {
      if (value === null) {
        return <NullNode />;
      }

      if (Array.isArray(value)) {
        return <ArrayNode depth={depth} value={value} />;
      }

      return <ObjectNode depth={depth} value={value} />;
    }
  }
}

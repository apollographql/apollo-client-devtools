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
import { useObjectViewerContext, useTypeOfValue } from "./context";
import { useCallback } from "react";

interface Props {
  context: Record<string, any> | undefined;
  className?: string;
  depth: number;
  value: unknown;
}

export const ValueNode = (parentProps: Props) => {
  const { context, className, depth, value } = parentProps;
  const type = useTypeOfValue(value);
  const ctx = useObjectViewerContext();
  const DefaultRender = useCallback(
    (props: Partial<Props>) => (
      <ValueNode
        {...{ ...parentProps, ...props }}
        context={{ ...parentProps.context, ...props.context }}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(parentProps)
  );

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
    case "object": {
      return <ObjectNode {...sharedProps} value={value as object} />;
    }
    default: {
      const Render = ctx.renderers[type];

      return Render ? (
        <Render {...sharedProps} DefaultRender={DefaultRender} value={value} />
      ) : (
        <DefaultRender className={className} value={value} />
      );
    }
  }
};

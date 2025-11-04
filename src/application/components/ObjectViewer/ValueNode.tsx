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

export const ValueNode = ({ context, className, depth, value }: Props) => {
  const type = useTypeOfValue(value);
  const ctx = useObjectViewerContext();
  const DefaultRender = useCallback(
    (props: {
      className?: string;
      context?: Record<string, any>;
      value: unknown;
    }) => (
      <ValueNode
        {...props}
        context={{ ...context, ...props.context }}
        depth={depth}
      />
    ),
    [context, depth]
  );

  switch (type) {
    case "array":
      return (
        <ArrayNode
          depth={depth}
          className={className}
          value={value as unknown[]}
        />
      );
    case "bigint":
      return (
        <BigintNode
          depth={depth}
          className={className}
          value={value as bigint}
        />
      );
    case "boolean":
      return (
        <BooleanNode
          context={context}
          depth={depth}
          className={className}
          value={value as boolean}
        />
      );
    case "function":
      return (
        <FunctionNode
          depth={depth}
          className={className}
          value={value as Function}
        />
      );
    case "number":
      return (
        <NumberNode
          depth={depth}
          className={className}
          value={value as number}
        />
      );
    case "null":
      return <NullNode depth={depth} className={className} />;
    case "string":
      return (
        <StringNode
          context={context}
          depth={depth}
          className={className}
          value={value as string}
        />
      );
    case "symbol":
      return (
        <SymbolNode
          depth={depth}
          className={className}
          value={value as symbol}
        />
      );
    case "undefined":
      return <UndefinedNode depth={depth} className={className} />;
    case "object": {
      return (
        <ObjectNode
          context={context}
          className={className}
          depth={depth}
          value={value as object}
        />
      );
    }
    default: {
      const Render = ctx.renderers[type];

      return Render ? (
        <Render
          depth={depth}
          className={className}
          context={context}
          DefaultRender={DefaultRender}
          value={value}
        />
      ) : (
        <DefaultRender className={className} value={value} />
      );
    }
  }
};

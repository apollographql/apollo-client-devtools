import type { ComponentPropsWithoutRef } from "react";
import { CloseBrace } from "./CloseBrace";
import { customRenderable } from "./CustomRenderable";
import { OpenBrace } from "./OpenBrace";

interface CollapsedObjectProps extends ComponentPropsWithoutRef<"span"> {
  context?: Record<string, any>;
  length: number;
}

export const CollapsedObject = customRenderable(
  "collapsedObject",
  ({ length, ...props }: CollapsedObjectProps) => {
    return (
      <span {...props}>
        <OpenBrace />
        {length > 0 && (
          <span className="text-[var(--ov-ellipsis-color,var(--ov-punctuation-color))] cursor-pointer">
            ...
          </span>
        )}
        <CloseBrace />
      </span>
    );
  },
  (parentProps, props: Omit<CollapsedObjectProps, "length">) => ({
    ...parentProps,
    ...props,
    length: parentProps.length,
  })
);

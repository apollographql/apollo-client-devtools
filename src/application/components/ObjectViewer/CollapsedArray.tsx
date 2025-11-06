import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import { OpenBracket } from "./OpenBracket";
import { CloseBracket } from "./CloseBracket";

interface CollapsedArrayProps extends ComponentPropsWithoutRef<"span"> {
  context?: Record<string, any>;
  length: number;
}

export const CollapsedArray = customRenderable(
  "collapsedArray",
  ({ length, ...props }: CollapsedArrayProps) => {
    return (
      <span {...props}>
        <OpenBracket />
        {length > 0 && (
          <span className="text-[var(--ov-ellipsis-color,var(--ov-punctuation-color))] cursor-pointer">
            ...
          </span>
        )}
        <CloseBracket />
      </span>
    );
  },
  (parentProps, props: Omit<CollapsedArrayProps, "length">) => ({
    ...parentProps,
    ...props,
    length: parentProps.length,
  })
);

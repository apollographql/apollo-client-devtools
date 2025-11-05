import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import { OpenBracket } from "./OpenBracket";
import { CloseBracket } from "./CloseBracket";

interface CollapsedArrayProps extends ComponentPropsWithoutRef<"span"> {
  context?: Record<string, any>;
}

export const CollapsedArray = customRenderable(
  "collapsedArray",
  (props: CollapsedArrayProps) => {
    return (
      <span {...props}>
        <OpenBracket />
        <span className="text-[var(--ov-ellipsis-color,var(--ov-punctuation-color))] cursor-pointer">
          ...
        </span>
        <CloseBracket />
      </span>
    );
  }
);

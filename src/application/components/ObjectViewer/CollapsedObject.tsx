import type { ComponentPropsWithoutRef } from "react";
import { CloseBrace } from "./CloseBrace";
import { customRenderable } from "./CustomRenderable";
import { OpenBrace } from "./OpenBrace";

interface CollapsedObjectProps extends ComponentPropsWithoutRef<"span"> {
  context?: Record<string, any>;
}

export const CollapsedObject = customRenderable(
  "collapsedObject",
  (props: CollapsedObjectProps) => {
    return (
      <span {...props}>
        <OpenBrace />
        <span className="text-[var(--ov-ellipsis-color,var(--ov-punctuation-color))] cursor-pointer">
          ...
        </span>
        <CloseBrace />
      </span>
    );
  }
);

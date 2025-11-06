import type { ComponentPropsWithoutRef } from "react";
import { CollapsedArray } from "./CollapsedArray";
import { CollapsedObject } from "./CollapsedObject";

interface CollapsedProps extends ComponentPropsWithoutRef<"span"> {
  context?: Record<string, any>;
  value: unknown;
}

export function Collapsed({ value, ...props }: CollapsedProps) {
  if (Array.isArray(value)) {
    return <CollapsedArray {...props} length={value.length} />;
  }

  if (typeof value === "object" && value !== null) {
    return <CollapsedObject {...props} length={Object.keys(value).length} />;
  }

  return null;
}

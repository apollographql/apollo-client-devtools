import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import { IterableItem } from "./IterableItem";
import type { Path } from "./types";

interface ArrayItemProps extends ComponentPropsWithoutRef<"div"> {
  context: Record<string, any> | undefined;
  expandable?: boolean;
  depth: number;
  index: number;
  value: unknown;
  path: Path;
}

export const ArrayItem = customRenderable(
  "arrayItem",
  ({
    depth,
    context,
    index,
    value,
    path,
    expandable = Array.isArray(value) ||
      (typeof value === "object" && value !== null),
    ...rest
  }: ArrayItemProps) => {
    return (
      <IterableItem
        {...rest}
        expandable={expandable}
        context={context}
        depth={depth}
        itemKey={index}
        value={value}
        path={path}
      />
    );
  },
  (parentProps, props: Partial<Omit<ArrayItemProps, "depth">>) => ({
    ...parentProps,
    ...props,
    depth: parentProps.depth,
  })
);

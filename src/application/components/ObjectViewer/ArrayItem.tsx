import { customRenderable } from "./CustomRenderable";
import { IterableItem } from "./IterableItem";
import type { Path } from "./types";

interface ArrayItemProps {
  className?: string;
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
    className,
    depth,
    context,
    index,
    value,
    path,
    expandable = Array.isArray(value) ||
      (typeof value === "object" && value !== null),
  }: ArrayItemProps) => {
    return (
      <IterableItem
        expandable={expandable}
        context={context}
        className={className}
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

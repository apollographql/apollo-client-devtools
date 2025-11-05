import { customRenderable } from "./CustomRenderable";
import { IterableItem } from "./IterableItem";

interface ArrayItemProps {
  className?: string;
  context: Record<string, any> | undefined;
  expandable?: boolean;
  depth: number;
  index: number;
  value: unknown;
}

export const ArrayItem = customRenderable(
  "arrayItem",
  ({
    className,
    depth,
    context,
    index,
    value,
    expandable = Array.isArray(value) ||
      (typeof value === "object" && value !== null),
  }: ArrayItemProps) => {
    return (
      <IterableItem
        expandable={expandable}
        context={context}
        className={className}
        depth={depth + 1}
        itemKey={index}
        value={value}
      />
    );
  },
  (parentProps, props: Partial<Omit<ArrayItemProps, "depth">>) => ({
    ...parentProps,
    ...props,
    depth: parentProps.depth,
  })
);

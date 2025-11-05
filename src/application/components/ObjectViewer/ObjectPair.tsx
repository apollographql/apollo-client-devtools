import { customRenderable } from "./CustomRenderable";
import { IterableItem } from "./IterableItem";

interface ObjectPairProps {
  className?: string;
  context: Record<string, any> | undefined;
  depth: number;
  expandable?: boolean;
  objectKey: string;
  value: unknown;
}

export const ObjectPair = customRenderable(
  "objectPair",
  ({
    className,
    context,
    depth,
    value,
    objectKey,
    expandable = Array.isArray(value) ||
      (typeof value === "object" && value !== null),
  }: ObjectPairProps) => {
    return (
      <IterableItem
        expandable={expandable}
        context={context}
        className={className}
        depth={depth + 1}
        itemKey={objectKey}
        value={value}
      />
    );
  },
  (parentProps, props: Partial<Omit<ObjectPairProps, "depth">>) => ({
    ...parentProps,
    ...props,
    depth: parentProps.depth,
  })
);

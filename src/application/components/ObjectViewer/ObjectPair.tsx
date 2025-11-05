import { customRenderable } from "./CustomRenderable";
import { IterableItem } from "./IterableItem";
import type { Path } from "./types";

interface ObjectPairProps {
  className?: string;
  context: Record<string, any> | undefined;
  depth: number;
  expandable?: boolean;
  objectKey: string;
  value: unknown;
  path: Path;
}

export const ObjectPair = customRenderable(
  "objectPair",
  ({
    className,
    context,
    depth,
    path,
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
        depth={depth}
        itemKey={objectKey}
        value={value}
        path={path}
      />
    );
  },
  (parentProps, props: Partial<Omit<ObjectPairProps, "depth" | "path">>) => ({
    ...parentProps,
    ...props,
    depth: parentProps.depth,
  })
);

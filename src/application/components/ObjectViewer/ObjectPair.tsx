import type { ComponentPropsWithoutRef } from "react";
import { customRenderable } from "./CustomRenderable";
import { IterableItem } from "./IterableItem";
import type { Path } from "./types";

interface ObjectPairProps extends ComponentPropsWithoutRef<"div"> {
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
    context,
    depth,
    path,
    value,
    objectKey,
    expandable = Array.isArray(value) ||
      (typeof value === "object" && value !== null),
    ...rest
  }: ObjectPairProps) => {
    return (
      <IterableItem
        {...rest}
        expandable={expandable}
        context={context}
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

import { IterableItem } from "./IterableItem";

export function ObjectPair({
  className,
  context,
  depth,
  value,
  objectKey,
  expandable = Array.isArray(value) ||
    (typeof value === "object" && value !== null),
}: {
  className?: string;
  context: Record<string, any> | undefined;
  depth: number;
  expandable?: boolean;
  objectKey: string;
  value: unknown;
}) {
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
}

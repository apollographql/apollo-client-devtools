import { IterableItem } from "./IterableItem";

export const ArrayItem = ({
  className,
  depth,
  context,
  index,
  value,
  expandable = Array.isArray(value) ||
    (typeof value === "object" && value !== null),
}: {
  className?: string;
  context: Record<string, any> | undefined;
  expandable?: boolean;
  depth: number;
  index: number;
  value: unknown;
}) => {
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
};
// export function ArrayItem({ context, className, depth, index, value }) {
//   return (
//     <IterableItem
//       context={context}
//       className={className}
//       depth={depth + 1}
//       itemKey={index}
//       value={value}
//     />
//   );
// }

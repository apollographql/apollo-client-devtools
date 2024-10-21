import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface DefinitionListItemProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  term: string;
  value: ReactNode;
}

export function DefinitionListItem({
  className,
  term,
  value,
  ...props
}: DefinitionListItemProps) {
  return (
    <div {...props} className={twMerge("flex gap-3 py-2", className)}>
      <dt className="font-semibold">{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

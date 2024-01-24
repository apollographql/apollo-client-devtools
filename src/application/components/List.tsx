import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

type ListProps = ComponentPropsWithoutRef<"div">;

export function List({ className, ...props }: ListProps) {
  return <div {...props} className={clsx(className, "overflow-y-auto")} />;
}

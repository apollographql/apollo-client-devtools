import type { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

type ListProps = ComponentPropsWithoutRef<"ul">;

export function List({ className, ...props }: ListProps) {
  return (
    <ul
      {...props}
      className={clsx(
        className,
        "overflow-y-auto flex flex-col gap-2 list-none"
      )}
    />
  );
}

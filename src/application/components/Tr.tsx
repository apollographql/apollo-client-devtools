import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type TrProps = ComponentPropsWithoutRef<"tr">;

export function Tr({ className, ...props }: TrProps) {
  return (
    <tr
      {...props}
      className={twMerge(
        "focus-visible:outline-0 focus-visible:bg-tableHover dark:focus-visible:bg-tableHover-dark group/tr",
        className
      )}
    />
  );
}

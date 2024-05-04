import type { ReactNode } from "react";
import clsx from "clsx";

interface ButtonGroupProps {
  className?: string;
  children: ReactNode;
}

export function ButtonGroup({ className, children }: ButtonGroupProps) {
  return (
    <div className={clsx("flex gap-2 items-center", className)}>{children}</div>
  );
}

import type { ReactNode } from "react";
import { clsx } from "clsx";

interface BodyProps {
  className?: string;
  children: ReactNode;
}

export function Body({ className, children }: BodyProps) {
  return (
    <div className={clsx(className, "text-md flex-1 pt-2 first:pt-0")}>
      {children}
    </div>
  );
}

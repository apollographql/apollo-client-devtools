import type { ReactNode } from "react";
import { clsx } from "clsx";

interface BodyProps {
  className?: string;
  children: ReactNode;
}

export function Body({ className, children }: BodyProps) {
  return (
    <div
      className={clsx(
        className,
        "text-md flex-1 px-6 py-4 first:pt-6 last:pb-6"
      )}
    >
      {children}
    </div>
  );
}

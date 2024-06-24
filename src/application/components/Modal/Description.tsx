import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface DescriptionProps {
  className?: string;
  children?: ReactNode;
}

export function Description({ className, children }: DescriptionProps) {
  return (
    <p
      className={twMerge(
        "text-secondary dark:text-secondary-dark text-md font-normal",
        className
      )}
    >
      {children}
    </p>
  );
}

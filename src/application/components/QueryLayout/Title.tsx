import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface TitleProps {
  className?: string;
  children: ReactNode;
}

export function Title({ className, children }: TitleProps) {
  return (
    <h1
      data-testid="title"
      className={twMerge(
        "font-code font-medium text-2xl text-heading dark:text-heading-dark",
        className
      )}
    >
      {children}
    </h1>
  );
}

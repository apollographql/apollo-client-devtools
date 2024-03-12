import type { ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
}

export function Title({ children }: TitleProps) {
  return (
    <h1
      data-testid="title"
      className="font-code font-medium text-2xl text-heading dark:text-heading-dark"
    >
      {children}
    </h1>
  );
}

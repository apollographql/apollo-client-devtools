import { ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
}

export function Title({ children }: TitleProps) {
  return (
    <h1
      data-testid="title"
      className="font-heading font-medium text-2xl text-heading dark:text-heading-dark"
    >
      <code>{children}</code>
    </h1>
  );
}

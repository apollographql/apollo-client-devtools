import { ReactNode } from "react";

interface TitleProps {
  children: ReactNode;
}

export function Title({ children }: TitleProps) {
  return (
    <h1 className="prose-2xl text-heading dark:text-heading-dark">
      <code>{children}</code>
    </h1>
  );
}

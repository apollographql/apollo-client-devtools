import type { ReactNode } from "react";

interface ContentProps {
  children?: ReactNode;
}

export function Content({ children }: ContentProps) {
  return (
    <div className="[grid-area:content] overflow-auto flex flex-col">
      {children}
    </div>
  );
}

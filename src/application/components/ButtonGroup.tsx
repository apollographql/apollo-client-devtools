import type { ReactNode } from "react";

interface ButtonGroupProps {
  children: ReactNode;
}

export function ButtonGroup({ children }: ButtonGroupProps) {
  return <div className="flex gap-2 items-center">{children}</div>;
}

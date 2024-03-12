import type { ReactNode } from "react";

interface HeaderProps {
  children: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <div className="flex items-center justify-between [grid-area:header]">
      {children}
    </div>
  );
}

import type { ReactNode } from "react";
import { clsx } from "clsx";

interface HeaderProps {
  className?: string;
  children: ReactNode;
}

export function Header({ className, children }: HeaderProps) {
  return (
    <header className={clsx(className, "flex flex-col pt-6 px-6 pb-4 gap-2")}>
      {children}
    </header>
  );
}

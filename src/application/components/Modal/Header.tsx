import type { ReactNode } from "react";
import { clsx } from "clsx";

interface HeaderProps {
  className?: string;
  children: ReactNode;
}

export function Header({ className, children }: HeaderProps) {
  return <header className={clsx(className, "flex")}>{children}</header>;
}

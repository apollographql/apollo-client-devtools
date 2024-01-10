import { ReactNode } from "react";
import { clsx } from "clsx";

interface FooterProps {
  className?: string;
  children: ReactNode;
}

export function Footer({ className, children }: FooterProps) {
  return (
    <footer
      className={clsx(className, "flex flex-row-reverse justify-between")}
    >
      {children}
    </footer>
  );
}

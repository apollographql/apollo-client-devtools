import { ReactNode } from "react";
import { clsx } from "clsx";

interface FooterProps {
  className?: string;
  children: ReactNode;
}

export function Footer({ className, children }: FooterProps) {
  return (
    <footer
      className={clsx(
        className,
        "flex pt-6 justify-end has-[>:nth-child(2)]:justify-between"
      )}
    >
      {children}
    </footer>
  );
}

import { ReactNode } from "react";

interface FooterProps {
  children: ReactNode;
}

export function Footer({ children }: FooterProps) {
  return (
    <footer className="flex flex-row-reverse justify-between">
      {children}
    </footer>
  );
}

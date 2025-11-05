import type { ReactNode } from "react";

interface PunctuationProps {
  children: ReactNode;
}

export function Punctuation({ children }: PunctuationProps) {
  return <span className="text-[var(--ov-punctuation-color)]">{children}</span>;
}

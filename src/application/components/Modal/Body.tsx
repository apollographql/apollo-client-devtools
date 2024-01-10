import { ReactNode } from "react";

interface BodyProps {
  children: ReactNode;
}

export function Body({ children }: BodyProps) {
  return <div className="text-md">{children}</div>;
}

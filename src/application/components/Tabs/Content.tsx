import { ReactNode } from "react";
import { Content as ContentBase } from "@radix-ui/react-tabs";

interface ContentProps {
  children: ReactNode;
  value: string;
}

export function Content({ children, value }: ContentProps) {
  return <ContentBase value={value}>{children}</ContentBase>;
}

import { ReactNode } from "react";
import { Content as ContentBase } from "@radix-ui/react-tabs";

interface ContentProps {
  asChild?: boolean;
  children: ReactNode;
  forceMount?: true;
  value: string;
}

export function Content({
  asChild,
  children,
  forceMount,
  value,
}: ContentProps) {
  return (
    <ContentBase asChild={asChild} forceMount={forceMount} value={value}>
      {children}
    </ContentBase>
  );
}

import { ReactNode } from "react";
import { Content as ContentBase } from "@radix-ui/react-tabs";

interface ContentProps {
  children: ReactNode;
  forceMount?: true;
  value: string;
}

export function Content({ children, forceMount, value }: ContentProps) {
  return (
    <ContentBase forceMount={forceMount} value={value}>
      {children}
    </ContentBase>
  );
}

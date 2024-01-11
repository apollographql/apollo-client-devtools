import { ReactNode } from "react";
import { Content as ContentBase } from "@radix-ui/react-tabs";

interface ContentProps {
  className?: string;
  children: ReactNode;
  forceMount?: true;
  value: string;
}

export function Content({
  className,
  children,
  forceMount,
  value,
}: ContentProps) {
  return (
    <ContentBase className={className} forceMount={forceMount} value={value}>
      {children}
    </ContentBase>
  );
}

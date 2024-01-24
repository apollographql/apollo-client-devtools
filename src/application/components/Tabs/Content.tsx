import { ReactNode } from "react";
import { Content as ContentBase } from "@radix-ui/react-tabs";
import clsx from "clsx";

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
    <ContentBase
      className={clsx(className, "data-state-inactive:hidden")}
      forceMount={forceMount}
      value={value}
    >
      {children}
    </ContentBase>
  );
}

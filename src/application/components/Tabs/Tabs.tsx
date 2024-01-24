import { ReactNode } from "react";
import { Root } from "@radix-ui/react-tabs";
import clsx from "clsx";

import { Content } from "./Content";
import { List } from "./List";
import { Trigger } from "./Trigger";

interface TabsProps {
  children: ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Tabs({
  children,
  className,
  defaultValue,
  value,
  onChange,
}: TabsProps) {
  return (
    <Root
      className={clsx(className, "flex data-orientation-horizontal:flex-col")}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onChange}
    >
      {children}
    </Root>
  );
}

Tabs.Content = Content;
Tabs.List = List;
Tabs.Trigger = Trigger;

import type { ReactNode } from "react";
import { Root } from "@radix-ui/react-tabs";
import clsx from "clsx";

import { Content } from "./Content";
import { List } from "./List";
import { Trigger } from "./Trigger";

interface TabsProps<TValue extends string> {
  children: ReactNode;
  className?: string;
  defaultValue?: TValue;
  value?: TValue;
  onChange?: (value: TValue) => void;
}

export function Tabs<TValue extends string = string>({
  children,
  className,
  defaultValue,
  value,
  onChange,
}: TabsProps<TValue>) {
  return (
    <Root
      className={clsx(className, "flex data-orientation-horizontal:flex-col")}
      defaultValue={defaultValue}
      value={value}
      onValueChange={(value) => onChange?.(value as TValue)}
    >
      {children}
    </Root>
  );
}

Tabs.Content = Content;
Tabs.List = List;
Tabs.Trigger = Trigger;

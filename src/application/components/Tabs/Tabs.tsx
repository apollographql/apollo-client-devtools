import { ReactNode } from "react";
import { Root } from "@radix-ui/react-tabs";

import { Content } from "./Content";
import { List } from "./List";
import { Trigger } from "./Trigger";

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ children, defaultValue, value, onChange }: TabsProps) {
  return (
    <Root defaultValue={defaultValue} value={value} onValueChange={onChange}>
      {children}
    </Root>
  );
}

Tabs.Content = Content;
Tabs.List = List;
Tabs.Trigger = Trigger;

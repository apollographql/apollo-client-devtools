import { ReactNode } from "react";
import { Tabs } from "../Tabs";

interface TabContentProps {
  children: ReactNode;
  value: string;
}

export function TabContent({ children, value }: TabContentProps) {
  return (
    <Tabs.Content
      className="text-sm py-4 lg:flex-1 lg:overflow-auto"
      value={value}
    >
      {children}
    </Tabs.Content>
  );
}

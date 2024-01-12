import { ReactNode } from "react";
import { Tabs as TabsBase } from "../Tabs";

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ children, defaultValue, value, onChange }: TabsProps) {
  return (
    <TabsBase
      className="[grid-area:tabs] lg:overflow-hidden lg:-my-2"
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
    >
      {children}
    </TabsBase>
  );
}

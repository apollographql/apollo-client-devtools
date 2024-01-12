import { ReactNode } from "react";
import { Tabs as TabsBase } from "../Tabs";

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ children, value, onChange }: TabsProps) {
  return (
    <TabsBase
      className="[grid-area:tabs] lg:overflow-hidden lg:-my-2"
      value={value}
      onChange={onChange}
    >
      {children}
    </TabsBase>
  );
}

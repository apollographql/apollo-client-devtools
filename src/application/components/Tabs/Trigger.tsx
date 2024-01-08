import { ReactNode } from "react";
import { Trigger as TriggerBase } from "@radix-ui/react-tabs";

interface TriggerProps {
  children: ReactNode;
  value: string;
}

export function Trigger({ children, value }: TriggerProps) {
  return (
    <TriggerBase
      className="px-2 pb-2 data-state-active:text-white data-state-active:border-b-focused dark:data-state-active:border-b-focused-dark data-state-active:border-b"
      value={value}
    >
      {children}
    </TriggerBase>
  );
}

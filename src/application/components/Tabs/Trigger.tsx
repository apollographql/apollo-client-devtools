import type { ReactNode } from "react";
import { Trigger as TriggerBase } from "@radix-ui/react-tabs";

interface TriggerProps {
  children: ReactNode;
  value: string;
}

export function Trigger({ children, value }: TriggerProps) {
  return (
    <TriggerBase
      className="py-2 text-md text-secondary dark:text-secondary-dark data-state-active:font-semibold data-state-active:text-primary dark:data-state-active:text-primary-dark border-b-4 border-b-transparent data-state-active:border-b-neutral dark:data-state-active:border-b-neutral-dark whitespace-nowrap focus:ring-3 focus:ring-offset-0 focus:ring-offset-primary focus:dark:ring-offset-primary-dark focus:ring-focused focus:dark:ring-focused-dark focus:rounded"
      value={value}
    >
      {children}
    </TriggerBase>
  );
}

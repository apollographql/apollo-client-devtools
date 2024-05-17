import * as BaseHoverCard from "@radix-ui/react-hover-card";
import type { ReactNode } from "react";

interface TriggerProps {
  asChild?: boolean;
  children?: ReactNode;
}

export function Trigger({ asChild, children }: TriggerProps) {
  return (
    <BaseHoverCard.Trigger asChild={asChild}>{children}</BaseHoverCard.Trigger>
  );
}

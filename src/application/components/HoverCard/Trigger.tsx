import * as BaseHoverCard from "@radix-ui/react-hover-card";
import type { ReactNode } from "react";

interface TriggerProps {
  children?: ReactNode;
}

export function Trigger({ children }: TriggerProps) {
  return <BaseHoverCard.Trigger>{children}</BaseHoverCard.Trigger>;
}

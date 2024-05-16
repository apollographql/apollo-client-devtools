import type { ReactNode } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";

interface ContentProps {
  children?: ReactNode;
}

export function Content({ children }: ContentProps) {
  return (
    <HoverCard.Portal>
      <HoverCard.Content className="bg-secondary dark:bg-secondary-dark rounded-lg px-4 py-3 shadow-popovers text-sm max-w-96 overflow-auto max-h-screen">
        {children}
        <HoverCard.Arrow className="fill-secondary dark:fill-secondary-dark" />
      </HoverCard.Content>
    </HoverCard.Portal>
  );
}

import { Root, Content, Portal, Trigger } from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

interface TooltipProps {
  asChild?: boolean;
  content: ReactNode;
  children?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, side = "bottom" }: TooltipProps) {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          sideOffset={4}
          className="shadow-popovers border rounded bg-black dark:bg-black-dark border-black dark:border-black-dark py-1 px-2 text-white dark:text-white-dark text-sm font-body"
          side={side}
        >
          {content}
        </Content>
      </Portal>
    </Root>
  );
}

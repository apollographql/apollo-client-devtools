import { Root, Content, Portal, Trigger } from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

interface TooltipProps {
  asChild?: boolean;
  content: ReactNode;
  children?: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <Root>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content className="shadow-popovers bg-black dark:bg-black-dark border-black dark:border-black-dark py-1 px-2 text-white dark:text-white-dark">
          {content}
        </Content>
      </Portal>
    </Root>
  );
}

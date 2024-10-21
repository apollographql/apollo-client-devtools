import { Content } from "@radix-ui/react-accordion";
import type { AccordionContentProps as BaseAccordionContentProps } from "@radix-ui/react-accordion";
import { twMerge } from "tailwind-merge";

type AccordionContentProps = Omit<BaseAccordionContentProps, "asChild">;

export function AccordionContent({
  className,
  ...props
}: AccordionContentProps) {
  return (
    <Content
      {...props}
      className={twMerge(
        "p-4 rounded-b border border-primary dark:border-primary-dark border-t-0",
        className
      )}
    />
  );
}

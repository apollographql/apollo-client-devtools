import { Content } from "@radix-ui/react-accordion";
import type { AccordionContentProps as BaseAccordionContentProps } from "@radix-ui/react-accordion";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type AccordionContentProps = Omit<BaseAccordionContentProps, "asChild">;

export function AccordionContent({
  className,
  ...props
}: AccordionContentProps) {
  return (
    <Content {...props} asChild>
      <AnimatedContent {...(props as AnimatedContentProps)} />
    </Content>
  );
}

type AnimatedContentProps = ComponentPropsWithoutRef<typeof motion.div>;

const AnimatedContent = forwardRef<HTMLDivElement, AnimatedContentProps>(
  ({ className, ...props }) => {
    const show = (props as Record<string, unknown>)["data-state"] === "open";

    return (
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            {...props}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transitionEnd: { display: "none" } }}
            style={{ display: "block" }}
            className="rounded-b border border-primary dark:border-primary-dark border-t-0 overflow-hidden"
          >
            <div
              className={twMerge(
                "p-4 bg-primary dark:bg-primary-dark",
                className
              )}
            >
              {props.children as ReactNode}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

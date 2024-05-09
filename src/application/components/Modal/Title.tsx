import type { ReactNode } from "react";
import { Dialog } from "@headlessui/react";
import { clsx } from "clsx";

interface TitleProps {
  className?: string;
  children: ReactNode;
}

export function Title({ className, children }: TitleProps) {
  return (
    <Dialog.Title
      as="h3"
      className={clsx(
        className,
        "text-heading dark:text-heading-dark text-xl font-medium font-heading"
      )}
    >
      {children}
    </Dialog.Title>
  );
}

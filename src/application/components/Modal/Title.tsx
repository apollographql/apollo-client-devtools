import { ReactNode } from "react";
import { Dialog } from "@headlessui/react";

interface TitleProps {
  children: ReactNode;
}

export function Title({ children }: TitleProps) {
  return (
    <Dialog.Title
      as="h3"
      className="text-heading dark:text-heading-dark text-lg font-medium font-heading"
    >
      {children}
    </Dialog.Title>
  );
}

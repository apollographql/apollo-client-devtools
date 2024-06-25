import type { ReactNode } from "react";
import { DisclosureButton as BaseDisclosureButton } from "@headlessui/react";
import IconChevronUp from "@apollo/icons/default/IconChevronUp.svg";
import clsx from "clsx";

interface DisclosureButtonProps {
  children: ReactNode;
}

export function DisclosureButton({ children }: DisclosureButtonProps) {
  return (
    <BaseDisclosureButton
      className={clsx(
        "bg-primary dark:bg-primary-dark border border-primary dark:border-primary-dark py-3 px-2 hover:bg-secondary hover:dark:bg-secondary-dark transition-colors text-left w-full font-heading text-heading dark:text-heading-dark font-medium text-md flex gap-2 items-center",
        "rounded-t ui-not-open:rounded-b"
      )}
    >
      {({ open }) => {
        return (
          <>
            <IconChevronUp
              className={clsx("w-4 transition-transform", {
                "rotate-180": open,
              })}
            />
            <span>{children}</span>
          </>
        );
      }}
    </BaseDisclosureButton>
  );
}

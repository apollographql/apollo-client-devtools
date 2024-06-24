import type { ReactNode } from "react";
import {
  DisclosurePanel as BaseDisclosurePanel,
  Transition,
} from "@headlessui/react";

interface DisclosurePanelProps {
  children: ReactNode;
}

export function DisclosurePanel({ children }: DisclosurePanelProps) {
  return (
    <Transition
      enter="transition duration-100 ease-out"
      enterFrom="transform opacity-0"
      enterTo="transform opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform opacity-100"
      leaveTo="transform opacity-0"
    >
      <BaseDisclosurePanel className="border border-t-0 border-primary dark:border-primary-dark rounded-b p-4">
        {children}
      </BaseDisclosurePanel>
    </Transition>
  );
}

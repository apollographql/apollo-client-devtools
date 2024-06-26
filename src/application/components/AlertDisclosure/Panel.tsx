import type { ReactNode } from "react";
import { DisclosurePanel, Transition } from "@headlessui/react";

interface AlertDisclosurePanelProps {
  children: ReactNode;
}

export function AlertDisclosurePanel({ children }: AlertDisclosurePanelProps) {
  return (
    <Transition
      enter="transition duration-100 ease-out"
      enterFrom="transform opacity-0"
      enterTo="transform opacity-100"
      leave="transition duration-75 ease-out"
      leaveFrom="transform opacity-100"
      leaveTo="transform opacity-0"
    >
      <DisclosurePanel className="px-6 py-3 rounded bg-error dark:bg-error-dark">
        {children}
      </DisclosurePanel>
    </Transition>
  );
}

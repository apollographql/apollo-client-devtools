import type { ReactNode } from "react";
import { Disclosure as DisclosureRoot } from "@headlessui/react";
import { DisclosureButton } from "./Button";
import { DisclosurePanel } from "./Panel";

interface DisclosureProps {
  children: ReactNode;
  className?: string;
}

export function Disclosure({ children, className }: DisclosureProps) {
  return (
    <DisclosureRoot>
      <div className={className}>{children}</div>
    </DisclosureRoot>
  );
}

Disclosure.Button = DisclosureButton;
Disclosure.Panel = DisclosurePanel;

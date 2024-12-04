import type { ReactNode } from "react";
import type { DisclosureProps as DisclosureRootProps } from "@headlessui/react";
import { Disclosure as DisclosureRoot } from "@headlessui/react";
import { DisclosureButton } from "./Button";
import { DisclosurePanel } from "./Panel";

interface DisclosureProps extends Pick<DisclosureRootProps, "defaultOpen"> {
  children: ReactNode;
  className?: string;
}

export function Disclosure({ children, className, ...props }: DisclosureProps) {
  return (
    <DisclosureRoot {...props}>
      <div className={className}>{children}</div>
    </DisclosureRoot>
  );
}

Disclosure.Button = DisclosureButton;
Disclosure.Panel = DisclosurePanel;

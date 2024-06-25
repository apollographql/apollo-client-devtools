import type { ReactNode } from "react";
import { Disclosure as DisclosureRoot } from "@headlessui/react";
import type { AlertProps } from "../Alert";
import { AlertDisclosureProvider } from "./AlertDisclosureContext";
import { AlertDisclosureButton } from "./Button";
import { AlertDisclosurePanel } from "./Panel";
import { twMerge } from "tailwind-merge";

interface AlertDisclosureProps {
  children: ReactNode;
  className?: string;
  variant: AlertProps["variant"];
}

export function AlertDisclosure({
  children,
  className,
  variant,
}: AlertDisclosureProps) {
  return (
    <AlertDisclosureProvider variant={variant}>
      <DisclosureRoot defaultOpen>
        <div className={twMerge("flex flex-col gap-2", className)}>
          {children}
        </div>
      </DisclosureRoot>
    </AlertDisclosureProvider>
  );
}

AlertDisclosure.Button = AlertDisclosureButton;
AlertDisclosure.Panel = AlertDisclosurePanel;

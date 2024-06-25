import { forwardRef, type ReactNode } from "react";
import { Disclosure } from "@headlessui/react";
import IconChevronUp from "@apollo/icons/default/IconChevronUp.svg";
import clsx from "clsx";
import type { AlertProps } from "../Alert";
import { Alert } from "../Alert";
import { useAlertDisclosure } from "./AlertDisclosureContext";

interface AlertDisclosureButtonProps {
  children: ReactNode;
}

export function AlertDisclosureButton({
  children,
}: AlertDisclosureButtonProps) {
  const { variant } = useAlertDisclosure();
  return (
    <Disclosure.Button className="w-full" as={AlertButton} variant={variant}>
      {({ open }) => {
        return (
          <div className="flex justify-between items-center">
            <span>{children}</span>
            <IconChevronUp
              className={clsx("w-4 transition-transform", {
                "rotate-180": open,
              })}
            />
          </div>
        );
      }}
    </Disclosure.Button>
  );
}

const AlertButton = forwardRef<HTMLButtonElement, AlertProps>((props, ref) => {
  return <Alert ref={ref} {...props} as="button" />;
});

import type { ReactNode } from "react";

interface ErrorAlertDisclosureItemProps {
  children?: ReactNode;
}

export function ErrorAlertDisclosureItem({
  children,
}: ErrorAlertDisclosureItemProps) {
  return (
    <li className="border-l-2 border-l-warning dark:border-l-warning-dark px-4 font-code text-sm font-normal text-error dark:text-error-dark">
      {children}
    </li>
  );
}

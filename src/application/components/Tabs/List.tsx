import { List as ListBase } from "@radix-ui/react-tabs";
import { ReactNode } from "react";

interface ListProps {
  children: ReactNode;
}

export function List({ children }: ListProps) {
  return (
    <ListBase className="flex h-full text-sm font-semibold border-b-primary dark:border-b-primary-dark border-b">
      {children}
    </ListBase>
  );
}

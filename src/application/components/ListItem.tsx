import { ReactNode, ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

interface ListItemProps {
  className?: string;
  children?: ReactNode;
  selected?: boolean;
  onClick?: ComponentPropsWithoutRef<"div">["onClick"];
}

export function ListItem({
  className,
  children,
  selected,
  onClick,
}: ListItemProps) {
  return (
    <div
      className={clsx(
        className,
        "flex items-center rounded cursor-pointer py-1 px-3",
        selected
          ? "bg-selected dark:bg-selected-dark"
          : "hover:bg-unselected dark:hover:bg-unselected-dark"
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
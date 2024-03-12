import type { ReactNode, ComponentPropsWithoutRef } from "react";
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
        "border-2 border-transparent flex items-center rounded-md cursor-pointer py-2 px-4",
        "focus:border-focused focus:dark:border-focused-dark",
        selected
          ? "text-white bg-selected dark:bg-selected-dark"
          : "hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark"
      )}
      onClick={onClick}
    >
      <div className="overflow-hidden whitespace-nowrap text-ellipsis">
        {children}
      </div>
    </div>
  );
}

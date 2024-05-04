import type { ReactNode, ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

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
      className={twMerge(
        className,
        "text-md text-primary dark:text-primary-dark",
        "transition-colors duration-200",
        "border-2 border-transparent flex items-center rounded-md cursor-pointer py-2 px-4",
        "focus:border-focused focus:dark:border-focused-dark",
        selected
          ? "font-semibold bg-neutral dark:bg-neutral-dark"
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

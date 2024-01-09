import { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

interface ButtonProps extends NativeButtonProps {
  variant: "secondary" | "hidden";
  size: "md" | "sm" | "xs";
}

export function Button({
  className,
  children,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(className, "flex items-center gap-2", {
        "py-2 px-3 rounded-lg text-md font-semibold": size === "md",
        "py-2 px-3 rounded text-sm font-semibold": size === "sm",
        "p-2 rounded text-sm font-semibold": size === "xs",
        "border bg-button-secondary dark:bg-button-secondary-dark border-primary dark:border-primary-dark hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark active:bg-selected active:dark:bg-selected-dark":
          variant === "secondary",
        "hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark active:bg-selected active:dark:bg-selected-dark":
          variant === "hidden",
      })}
    >
      {children}
    </button>
  );
}

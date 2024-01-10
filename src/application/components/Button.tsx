import { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

type NativeButtonProps = ComponentPropsWithoutRef<"button">;

interface ButtonProps extends NativeButtonProps {
  variant: "primary" | "secondary" | "hidden";
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
      className={clsx(
        className,
        "flex items-center gap-2",
        "focus:ring-3 focus:ring-offset-3 focus:ring-offset-primary focus:dark:ring-offset-primary-dark focus:ring-focused focus:dark:ring-focused-dark",
        "disabled:bg-button-disabled disabled:dark:bg-button-disabled-dark disabled:text-disabled disabled:dark:text-disabled-dark disabled:cursor-not-allowed",
        {
          "py-2 px-3 rounded-lg text-md font-semibold": size === "md",
          "py-2 px-3 rounded text-sm font-semibold": size === "sm",
          "p-2 rounded text-sm font-semibold": size === "xs",
          "bg-button-primary dark:bg-button-primary-dark hover:bg-button-primaryHover hover:dark:bg-button-primaryHover-dark active:bg-selected active:dark:bg-selected-dark":
            variant === "primary",
          "border bg-button-secondary dark:bg-button-secondary-dark border-primary dark:border-primary-dark hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark active:bg-selected active:dark:bg-selected-dark":
            variant === "secondary",
          "hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark active:bg-selected active:dark:bg-selected-dark":
            variant === "hidden",
        }
      )}
    >
      {children}
    </button>
  );
}

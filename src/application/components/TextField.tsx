import type { ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";

import type { ExtendProps } from "../types/props";

type TextFieldProps = ExtendProps<
  ComponentPropsWithoutRef<"input">,
  {
    label?: string;
    size: "sm" | "md";
  }
>;

export function TextField({
  className,
  label,
  size,
  type = "text",
  ...props
}: TextFieldProps) {
  return (
    <div className={clsx(className, "flex flex-col gap-2")}>
      {label && (
        <label
          className="text-heading dark:text-heading-dark font-medium font-heading text-md"
          htmlFor={props.name}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        type={type}
        className={clsx(
          "border-2 bg-input dark:bg-input-dark border-primary dark:border-primary-dark placeholder:text-placeholder placeholder:dark:text-placeholder-dark",
          "focus:border-focused focus:dark:border-focused-dark focus:outline-none focus:border-2",
          "disabled:bg-disabled disabled:dark:bg-disabled-dark disabled:text-disabled disabled:dark:text-disabled disabled:border-secondary disabled:dark:border-secondary-dark disabled:placeholder:text-disabled disabled:dark:placeholder:text-disabled-dark disabled:cursor-not-allowed",
          {
            "rounded-lg py-2 px-3": size === "md",
            "rounded py-1 px-3": size === "sm",
          }
        )}
      />
    </div>
  );
}

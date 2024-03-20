import type { ReactNode } from "react";
import * as SelectBase from "@radix-ui/react-select";
import { Option } from "./Option";
import IconChevronDown from "@apollo/icons/default/IconChevronDown.svg";
import IconChevronUp from "@apollo/icons/default/IconChevronUp.svg";
import { clsx } from "clsx";

interface SelectProps extends SelectBase.SelectTriggerProps {
  align?: "start" | "center" | "end";
  children: ReactNode;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  value?: string;
}

export function Select({
  align,
  children,
  defaultValue,
  disabled,
  name,
  onValueChange,
  placeholder,
  size = "md",
  value,
}: SelectProps) {
  return (
    <SelectBase.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      <SelectBase.Trigger
        disabled={disabled}
        className={clsx(
          "group flex gap-4 items-center bg-input dark:bg-input-dark border border-primary dark:border-primary-dark",
          "hover:border-hover dark:hover:border-hover-dark transition-colors ease-out",
          "focus:border-focused dark:focus:border-focused-dark focus-visible:outline-none",
          "disabled:bg-disabled dark:disabled:bg-disabled-dark disabled:border-disabled dark:disabled:border-disabled-dark disabled:text-disabled dark:disabled:text-disabled-dark",
          {
            "py-1 px-3 rounded h-8": size === "sm",
            "py-2 px-3 rounded-lg h-10": size === "md",
            "p-3 rounded-lg h-12": size === "lg",
          }
        )}
      >
        <SelectBase.Value placeholder={placeholder ?? "Select..."} />
        <SelectBase.Icon className="group-data-state-open:rotate-180 transition-transform">
          <IconChevronDown className="w-4" />
        </SelectBase.Icon>
      </SelectBase.Trigger>
      <SelectBase.Portal>
        <SelectBase.Content
          align={align}
          sideOffset={6}
          position="popper"
          className="border border-primary bg-primary dark:bg-primary-dark dark:border-primary-dark shadow-dropdown overflow-hidden rounded-lg w-80 max-h-[calc(100vh-8rem)]"
        >
          <SelectBase.ScrollUpButton className="flex items-center justify-center cursor-default py-2 pointer-events-none">
            <IconChevronUp className="w-4" />
          </SelectBase.ScrollUpButton>
          <SelectBase.Viewport className="px-4 py-4">
            {children}
          </SelectBase.Viewport>
          <SelectBase.ScrollDownButton className="flex items-center justify-center cursor-default py-2 pointer-events-none">
            <IconChevronDown className="w-4" />
          </SelectBase.ScrollDownButton>
        </SelectBase.Content>
      </SelectBase.Portal>
    </SelectBase.Root>
  );
}

Select.Option = Option;

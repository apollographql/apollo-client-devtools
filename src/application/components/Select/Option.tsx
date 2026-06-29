import type { ReactNode } from "react";
import { forwardRef } from "react";
import * as SelectBase from "@radix-ui/react-select";
import clsx from "clsx";

export interface OptionProps {
  children?: ReactNode;
  disabled?: boolean;
  value: string;
}

export const Option = forwardRef<HTMLDivElement, OptionProps>(
  ({ children, disabled, value }: OptionProps, ref) => {
    return (
      <SelectBase.Item
        disabled={disabled}
        value={value}
        ref={ref}
        className={clsx(
          "border-2 border-transparent py-2 px-4 rounded-md h-10 text-md bg-primary dark:bg-primary-dark outline-none",
          "data-highlighted:bg-button-secondaryHover dark:data-highlighted:bg-button-secondaryHover-dark data-highlighted:cursor-pointer",
          "data-state-checked:!bg-selected dark:data-state-checked:!bg-selected-dark data-state-checked:text-white data-state-checked:font-semibold"
        )}
      >
        <SelectBase.ItemText>{children}</SelectBase.ItemText>
      </SelectBase.Item>
    );
  }
);

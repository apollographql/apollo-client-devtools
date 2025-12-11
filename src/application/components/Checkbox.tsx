import IconCheck2 from "@apollo/icons/small/IconCheck2.svg";
import { keyboard } from "@testing-library/user-event/dist/cjs/keyboard/index.js";
import type { ComponentPropsWithoutRef } from "react";
import { twJoin, twMerge } from "tailwind-merge";

interface Props extends ComponentPropsWithoutRef<"input"> {
  label?: string;
}

export function Checkbox({ label, ...props }: Props) {
  const { checked, disabled } = props;

  return (
    <label
      htmlFor={props.id}
      className="cursor-pointer inline-flex items-center align-top relative"
    >
      <input
        {...props}
        checked={checked}
        disabled={disabled}
        type="checkbox"
        className="border-0 [clip:rect(0px,0px,0px,0px)] size-px -m-px p-0 hidden whitespace-nowrap absolute"
      />
      <span
        aria-hidden
        data-state={checked ? "checked" : "unchecked"}
        className={twJoin(
          "inline-flex size-4 items-center justify-center gap-3 shrink-0 rounded border-[2px] border-deselected dark:border-deselected-dark text-white",
          "data-state-checked:bg-selected dark:data-state-checked:bg-selected-dark data-state-checked:border-bg-selected dark:data-state-checked:border-bg-selected-dark data-state-checked:text-icon-white",
          "focus:border-bg-selected dark:focus:border-bg-selected-dark",
          "focus:data-state-checked:border-selected dark:focus:data-state-checked:border-selected-dark focus:data-state-checked:bg-selected dark:focus:data-state-checked:bg-selected-dark",
          "disabled:border-disabled dark:disabled:border-disabled-dark disabled:text-white",
          "disabled:data-state-checked:border-bg-selected dark:disabled:data-state-checked:border-bg-selected-dark disabled:data-state-checked:text-white disabled:data-state-checked:opacity-40"
        )}
      >
        {checked && <IconCheck2 className="size-3" />}
      </span>
      {label && (
        <span
          className={twJoin(
            "text-primary dark:text-primary-dark font-body font-normal text-md select-none ms-2",
            disabled && "text-disabled dark:text-disabled-dark"
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}

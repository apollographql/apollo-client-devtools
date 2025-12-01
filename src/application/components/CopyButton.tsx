import copy from "copy-to-clipboard";
import type { ButtonProps } from "./Button";
import { Button } from "./Button";
import IconCopy from "@apollo/icons/default/IconCopy.svg";

type CopyButtonProps = Omit<
  Exclude<ButtonProps, { asChild: true }>,
  "asChild"
> & {
  text: string;
  size: ButtonProps["size"];
};

export function CopyButton({ text, ...props }: CopyButtonProps) {
  return (
    <Button
      {...props}
      asChild={false}
      onClick={(event) => {
        copy(text);
        props.onClick?.(event);
      }}
      aria-label="Copy"
      variant="hidden"
      icon={<IconCopy />}
    />
  );
}

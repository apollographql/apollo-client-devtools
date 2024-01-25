import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "./Button";
import IconCopy from "@apollo/icons/default/IconCopy.svg";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

interface CopyButtonProps {
  className?: string;
  text: string;
  size: ButtonProps["size"];
}

export function CopyButton({
  className,
  text,
  size,
  ...rest
}: CopyButtonProps) {
  return (
    <CopyToClipboard text={text}>
      <Button {...rest} className={className} size={size} variant="hidden">
        <IconCopy
          className={clsx({
            "h-4": size === "sm" || size === "md",
            "h-2": size === "xs",
          })}
        />
      </Button>
    </CopyToClipboard>
  );
}

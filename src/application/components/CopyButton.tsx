import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "./Button";
import { CopyIcon } from "./icons/Copy";

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
        <CopyIcon
          className={clsx({
            "h-4": size === "sm" || size === "md",
            "h-2": size === "xs",
          })}
        />
      </Button>
    </CopyToClipboard>
  );
}

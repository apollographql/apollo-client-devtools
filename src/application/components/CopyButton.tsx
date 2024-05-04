import type { ComponentPropsWithoutRef } from "react";
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
      <Button
        {...rest}
        aria-label="Copy"
        className={className}
        size={size}
        variant="hidden"
        icon={<IconCopy />}
      />
    </CopyToClipboard>
  );
}

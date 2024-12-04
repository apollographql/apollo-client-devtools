import { getPanelActor } from "../../../extension/devtools/panelActor";
import IconRun from "@apollo/icons/default/IconRun.svg";
import { Button, type ButtonProps } from "../Button";
import { forwardRef } from "react";

export const VSCodeCommandButton = forwardRef<
  HTMLButtonElement,
  Partial<ButtonProps & { asChild: false }> & {
    command: string;
  }
>(function VSCodeCommandButton({ command, ...props }, ref) {
  return (
    <Button
      variant="primary"
      size="sm"
      icon={<IconRun />}
      onClick={(e) => {
        e.preventDefault();
        getPanelActor(window).send({
          type: "vscode:executeCommand",
          command,
        });
      }}
      {...props}
      ref={ref}
    />
  );
});

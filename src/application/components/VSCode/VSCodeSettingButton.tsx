import { getPanelActor } from "../../../extension/devtools/panelActor";
import IconRun from "@apollo/icons/default/IconRun.svg";
import { Button, type ButtonProps } from "../Button";
import { forwardRef } from "react";

export const VSCodeSettingButton = forwardRef<
  HTMLButtonElement,
  Partial<ButtonProps & { asChild: false }> & {
    settingsKey: string;
  }
>(function VSCodeSettingButton({ settingsKey, ...props }, ref) {
  return (
    <Button
      variant="primary"
      size="sm"
      icon={<IconRun />}
      onClick={(e) => {
        e.preventDefault();
        getPanelActor(window).send({
          type: "vscode:executeCommand",
          command: "workbench.action.openSettings",
          arguments: [settingsKey],
        });
      }}
      {...props}
      ref={ref}
    />
  );
});

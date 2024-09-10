import { getPanelActor } from "../../../extension/devtools/panelActor";
import IconShow from "@apollo/icons/default/IconShow.svg";

export function VSCodeSetting({ name }: { name: string }) {
  return (
    <>
      <code>{name}</code>
      <button
        onClick={(e) => {
          e.preventDefault();
          getPanelActor(window).send({
            type: "vscode:executeCommand",
            command: "workbench.action.openSettings",
            arguments: [name],
          });
        }}
      >
        <IconShow className="size-4" />
      </button>
    </>
  );
}

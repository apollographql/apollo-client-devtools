import { getPanelActor } from "../../../extension/devtools/panelActor";
import IconRun from "@apollo/icons/default/IconRun.svg";
import { Button } from "../Button";

export function VSCodeCommand({
  command,
  title,
}: {
  command: string;
  title: string;
}) {
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="ml-auto"
        icon={<IconRun />}
        onClick={(e) => {
          e.preventDefault();
          getPanelActor(window).send({
            type: "vscode:executeCommand",
            command,
          });
        }}
      >
        {title}
      </Button>
    </>
  );
}

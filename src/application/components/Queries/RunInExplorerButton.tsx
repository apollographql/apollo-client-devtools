import type { Variables } from "../../types/scalars";
import { SET_OPERATION } from "../Explorer/postMessageHelpers";
import { currentScreen, Screens } from "../Layouts/Navigation";
import IconRun from "@apollo/icons/default/IconRun.svg";
import { Button } from "../Button";
import type { RefObject } from "react";
import type { Explorer } from "../Explorer/Explorer";

interface RunInExplorerButtonProps {
  operation: string;
  variables?: Variables;
  explorerRef: RefObject<Explorer.Ref | null>;
}

export const RunInExplorerButton = ({
  operation,
  variables,
  explorerRef,
}: RunInExplorerButtonProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="ml-auto"
      icon={<IconRun />}
      onClick={() => {
        explorerRef.current?.postMessage({
          name: SET_OPERATION,
          operation,
          variables: JSON.stringify(variables),
        });
        currentScreen(Screens.Explorer);
      }}
    >
      Run in Explorer
    </Button>
  );
};

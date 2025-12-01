import type { JSX } from "react";
import type { Variables } from "../../types/scalars";
import {
  postMessageToEmbed,
  SET_OPERATION,
} from "../Explorer/postMessageHelpers";
import { currentScreen, Screens } from "../Layouts/Navigation";
import IconRun from "@apollo/icons/default/IconRun.svg";
import { Button } from "../Button";

interface RunInExplorerButtonProps {
  operation: string;
  variables?: Variables;
  embeddedExplorerIFrame: HTMLIFrameElement | null;
}

export const RunInExplorerButton = ({
  operation,
  variables,
  embeddedExplorerIFrame,
}: RunInExplorerButtonProps): JSX.Element | null => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="ml-auto"
      disabled={!embeddedExplorerIFrame}
      icon={<IconRun />}
      onClick={() => {
        if (embeddedExplorerIFrame) {
          // send a post message to the embedded explorer to fill the operation
          postMessageToEmbed({
            message: {
              name: SET_OPERATION,
              operation,
              variables: JSON.stringify(variables),
            },
            embeddedExplorerIFrame,
          });
          currentScreen(Screens.Explorer);
        }
      }}
    >
      Run in Explorer
    </Button>
  );
};

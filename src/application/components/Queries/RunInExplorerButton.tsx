import { Variables } from "../../types/scalars";
import {
  postMessageToEmbed,
  SET_OPERATION,
} from "../Explorer/postMessageHelpers";
import { currentScreen, Screens } from "../Layouts/Navigation";
import { RunIcon } from "../icons/Run";
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
      variant="hidden"
      size="sm"
      className="peer is-explorer-button ml-auto"
      disabled={!embeddedExplorerIFrame}
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
      <RunIcon aria-hidden />
      Run in Explorer
    </Button>
  );
};

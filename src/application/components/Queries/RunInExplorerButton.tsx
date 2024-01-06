import { IconRun } from "@apollo/space-kit/icons/IconRun";
import { Variables } from "../../types/scalars";
import {
  postMessageToEmbed,
  SET_OPERATION,
} from "../Explorer/postMessageHelpers";
import { currentScreen, Screens } from "../Layouts/Navigation";

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
    embeddedExplorerIFrame && (
      <button
        className="peer is-explorer-button appearance-none flex items-center ml-auto border-none text-sm cursor-pointer"
        onClick={() => {
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
        }}
      >
        <IconRun className="w-3 mr-2" />
        <span>Run in Explorer</span>
      </button>
    )
  );
};

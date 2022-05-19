/** @jsx jsx */

import { IconRun } from "@apollo/space-kit/icons/IconRun";
import { jsx, css } from "@emotion/react";
import { rem } from "polished";
import {
  postMessageToEmbed,
  SET_OPERATION,
} from "../Explorer/postMessageHelpers";
import { currentScreen, Screens } from "../Layouts/Navigation";

interface RunInExplorerButtonProps {
  operation: string;
  variables?: Record<string, any>;
  embeddedExplorerIFrame: HTMLIFrameElement | null;
}

export const buttonStyles = css`
  appearance: none;
  display: flex;
  align-items: center;
  margin: 0 0 0 auto;
  border: none;
  font-size: ${rem(13)};
  color: var(--textPrimary);
  background-color: transparent;
  cursor: pointer;
  outline: none;

  > svg {
    width: ${rem(13)};
    margin-right: ${rem(8)};
  }
`;

export const RunInExplorerButton = ({
  operation,
  variables,
  embeddedExplorerIFrame,
}: RunInExplorerButtonProps): jsx.JSX.Element | null => {
  return (
    embeddedExplorerIFrame && (
      <button
        css={buttonStyles}
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
        <IconRun />
        <span>Run in Explorer</span>
      </button>
    )
  );
};

/** @jsx jsx */

import { IconRun } from "@apollo/space-kit/icons/IconRun";
import { jsx, css } from "@emotion/core";
import { rem } from "polished";

import { graphiQLQuery } from "../Explorer/Explorer";
import { currentScreen, Screens } from "../Layouts/Navigation";

interface RunInGraphiQLButtonProps {
  operation: string;
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

export const RunInGraphiQLButton = ({
  operation,
}: RunInGraphiQLButtonProps) => (
  <button
    css={buttonStyles}
    onClick={() => {
      graphiQLQuery(operation);
      currentScreen(Screens.Explorer);
    }}
  >
    <IconRun />
    <span>Run in GraphiQL</span>
  </button>
);

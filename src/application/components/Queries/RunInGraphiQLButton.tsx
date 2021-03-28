/** @jsx jsx */

import { IconRun } from "@apollo/space-kit/icons/IconRun";
import { jsx, css } from "@emotion/react";
import { rem } from "polished";

import { graphiQLOperation } from "../Explorer/Explorer";
import { currentScreen, Screens } from "../Layouts/Navigation";

interface RunInGraphiQLButtonProps {
  operation: string;
  variables?: Record<string, any>;
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
  variables,
}: RunInGraphiQLButtonProps) => (
  <button
    css={buttonStyles}
    onClick={() => {
      graphiQLOperation({ operation, variables });
      currentScreen(Screens.Explorer);
    }}
  >
    <IconRun />
    <span>Run in GraphiQL</span>
  </button>
);

/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";

import { CopyToClipboard } from "react-copy-to-clipboard";

import {
  queryViewStyles,
  headerStyles,
  copyIconStyle,
  queryStringHeader,
  queryStringMain,
  queryDataMain,
} from "../Queries/QueryViewer";
import SyntaxHighlighter from "../SyntaxHighlighter";
import { fragmentRegistry } from "../../fragmentRegistry";
import { gql } from "@apollo/client";
import { MutationViewer_mutation as WatchedMutation } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";

interface MutationViewerProps {
  mutation: WatchedMutation;
}

const queryDataHeader = css`
  grid-area: queryDataHeader;
  display: flex;
  height: 100%;
  background-color: transparent;
  ${headerStyles}
  color: var(--textPrimary);

  svg {
    margin-right: 0;
    margin-left: auto;
  }
`;

fragmentRegistry.register(gql`
  fragment MutationViewer_mutation on WatchedMutation {
    mutationString
    variables
  }
`);

export const MutationViewer = ({ mutation }: MutationViewerProps) => {
  return (
    <div css={queryViewStyles}>
      <h4 css={queryStringHeader}>
        Mutation String
        <CopyToClipboard text={mutation.mutationString}>
          <IconCopy css={copyIconStyle} data-testid="copy-mutation-string" />
        </CopyToClipboard>
      </h4>
      <SyntaxHighlighter
        css={queryStringMain}
        code={mutation.mutationString}
        language="graphql"
      />
      <div>
        <div css={queryDataHeader}>
          <span>Variables</span>
          <CopyToClipboard text={JSON.stringify(mutation.variables)}>
            <IconCopy
              css={copyIconStyle}
              data-testid="copy-mutation-variables"
            />
          </CopyToClipboard>
        </div>
        <div css={queryDataMain}>
          <JSONTreeViewer data={mutation.variables} />
        </div>
      </div>
    </div>
  );
};

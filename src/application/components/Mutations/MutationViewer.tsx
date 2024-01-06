/** @jsxImportSource @emotion/react */
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";

import { CopyToClipboard } from "react-copy-to-clipboard";

import {
  queryViewStyles,
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
          <IconCopy
            className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
            data-testid="copy-mutation-string"
          />
        </CopyToClipboard>
      </h4>
      <SyntaxHighlighter
        css={queryStringMain}
        code={mutation.mutationString}
        language="graphql"
      />
      <div>
        <div className="flex [grid-area:queryDataHeader] h-full text-sm font-semibold border-b-primary dark:border-b-primary-dark border-b">
          <span className="px-2 pb-2 text-white border-b-focused dark:border-b-focused-dark border-b">
            Variables
          </span>
          <CopyToClipboard text={JSON.stringify(mutation.variables)}>
            <IconCopy
              className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
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

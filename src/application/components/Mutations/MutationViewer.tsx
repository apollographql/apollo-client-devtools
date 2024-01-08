import { IconCopy } from "@apollo/space-kit/icons/IconCopy";

import { CopyToClipboard } from "react-copy-to-clipboard";

import { CodeBlock } from "../CodeBlock";
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
    <div className="pt-3 grid [grid-template-columns:minmax(12rem,2fr)_minmax(12rem,1fr)] [grid-template-rows:1.75rem_auto] gap-x-6 [grid-template-areas:'queryStringHeader_queryDataHeader'_'queryStringMain_queryDataMain']">
      <h4 className="[grid-area:queryStringHeader] flex justify-between m-0 text-sm font-bold border-b border-b-primary dark:border-b-primary-dark">
        Mutation String
        <CopyToClipboard text={mutation.mutationString}>
          <IconCopy
            className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
            data-testid="copy-mutation-string"
          />
        </CopyToClipboard>
      </h4>
      <CodeBlock
        className="[grid-area:queryStringMain] mt-4 text-sm h-full overflow-y-hidden"
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
        <div className="[grid-area:queryDataMain] mt-4 pb-4 text-sm">
          <JSONTreeViewer
            className="[&>li]:!pt-0"
            style={{ marginTop: 0 }}
            data={mutation.variables}
          />
        </div>
      </div>
    </div>
  );
};

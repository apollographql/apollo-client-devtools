import { IconCopy } from "@apollo/space-kit/icons/IconCopy";

import { CopyToClipboard } from "react-copy-to-clipboard";

import { CodeBlock } from "../CodeBlock";
import { fragmentRegistry } from "../../fragmentRegistry";
import { gql } from "@apollo/client";
import { MutationViewer_mutation as WatchedMutation } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { Tabs } from "../Tabs";

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
    <div className="pt-3 grid [grid-template-columns:1fr_350px] gap-6">
      <div>
        <CodeBlock
          className="overflow-y-hidden"
          code={mutation.mutationString}
          language="graphql"
        />
      </div>
      <Tabs defaultValue="variables">
        <Tabs.List>
          <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
          <CopyToClipboard text={JSON.stringify(mutation.variables)}>
            <IconCopy
              className="ml-auto !h-4 cursor-pointer text-secondary dark:text-secondary-dark hover:text-primary hover:dark:text-primary-dark"
              data-testid="copy-mutation-variables"
            />
          </CopyToClipboard>
        </Tabs.List>
        <div className="mt-4 pb-4 text-sm">
          <Tabs.Content value="variables">
            <JSONTreeViewer
              className="[&>li]:!pt-0"
              style={{ marginTop: 0 }}
              data={mutation.variables}
            />
          </Tabs.Content>
        </div>
      </Tabs>
    </div>
  );
};

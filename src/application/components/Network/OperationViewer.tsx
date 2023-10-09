/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { JSONTree } from "react-json-tree";
import { IconCopy } from "@apollo/space-kit/icons/IconCopy";

import { CopyToClipboard } from "react-copy-to-clipboard";

import { useTreeTheme } from "../../theme";
import {
  queryViewStyles,
  headerStyles,
  copyIconStyle,
  queryStringHeader,
  queryDataMain,
} from "../Queries/QueryViewer";
import SyntaxHighlighter from "../SyntaxHighlighter";
import { fragmentRegistry } from "../../fragmentRegistry";
import { gql } from "@apollo/client";

import { OperationViewer_mutation as WatchedMutation } from "../../types/gql";

interface OperationViewerProps {
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
  fragment OperationViewer_mutation on WatchedMutation {
    mutationString
    variables
  }
`);

function Table({ data, onChunkSelect }) {
  return (
    <div>
      <table className="w-full whitespace-nowrap text-left table-fixed">
        <colgroup>
          <col className="lg:w-3/12" />
          <col className="lg:w-9/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-xs leading-6 text-white">
          <tr>
            <th
              scope="col"
              className="hidden sr-only py-2 pl-0 pr-8 font-semibold sm:table-cell"
            >
              Time
            </th>
            <th
              scope="col"
              className="hidden sr-only py-2 pl-0 pr-8 font-semibold md:table-cell lg:pr-20"
            >
              Data
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((data, i) => (
            <tr
              onClick={() => {
                onChunkSelect(data.timestamp);
              }}
              key={data.timestamp}
            >
              <td className="hidden py-2 pl-0 pr-4 sm:table-cell sm:pr-8">
                <div className="flex gap-x-3">
                  <div className="rounded-md bg-gray-700/40 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-white/10">
                    {new Date(parseInt(data.timestamp)).toLocaleTimeString(
                      "en-US",
                      {
                        hour12: false,
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                        fractionalSecondDigits: 3,
                      }
                    )}
                  </div>
                </div>
              </td>
              <td className="hidden py-2 pl-0 text-xs leading-6 text-gray-400 md:table-cell overflow-hidden text-ellipsis">
                {JSON.stringify(data)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const OperationViewer = ({
  operation,
  onChunkSelect,
}: OperationViewerProps) => {
  const treeTheme = useTreeTheme();
  const stringifiedData = JSON.stringify(operation, null, 2);

  return (
    <div css={queryViewStyles}>
      <div>
        <h4 css={queryStringHeader}>
          Data
          <CopyToClipboard text={stringifiedData}>
            <IconCopy css={copyIconStyle} data-testid="copy-data-string" />
          </CopyToClipboard>
        </h4>
        <div className="font-monospace text-xs">
          {Array.isArray(operation?.data) ? (
            <Table onChunkSelect={onChunkSelect} data={operation?.data} />
          ) : (
            <JSONTree
              shouldExpandNodeInitially={() => true}
              data={operation?.data}
              theme={treeTheme}
              invertTheme={false}
            />
          )}
        </div>
      </div>
      <div>
        <div css={queryDataHeader}>
          <span>Variables</span>
          <CopyToClipboard text={JSON.stringify(operation.variables)}>
            <IconCopy
              css={copyIconStyle}
              data-testid="copy-operation-variables"
            />
          </CopyToClipboard>
        </div>
        <div css={queryDataMain}>
          <JSONTree
            data={operation.variables}
            theme={treeTheme}
            invertTheme={false}
          />
        </div>
      </div>
    </div>
  );
};

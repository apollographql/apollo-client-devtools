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
  queryStringMain,
  queryDataMain,
} from "../Queries/QueryViewer";
import SyntaxHighlighter from "../SyntaxHighlighter";
import { fragmentRegistry } from "../../fragmentRegistry";
import { gql } from "@apollo/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnResizeMode,
} from "@tanstack/react-table";

import { OperationViewer_mutation as WatchedMutation } from "../../types/gql";
import { useState } from "react";

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

type Request = {
  [timestamp: string]: unknown;
};

const columnHelper = createColumnHelper<Request>();

const columns = [
  columnHelper.accessor("timestamp", {
    cell: (info) => {
      return JSON.stringify(info.getValue());
    },
    maxSize: 200,
    minSize: 150,
  }),
  columnHelper.accessor("data", {
    cell: (info) => {
      return JSON.stringify(info.getValue());
    },
    maxSize: 300,
  }),
];

function Table({ data }) {
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  return (
    <div className="p-2 block max-w-full overflow-x-scroll overflow-y-">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="flex" key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ position: "relative", width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {i === 0
                    ? header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`resizer ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`}
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            height: "100%",
                            width: "5px",
                            background: "grey",
                            cursor: "col-resize",
                            userSelect: "none",
                            touchAction: "none",
                          }}
                        ></div>
                      )
                    : // <div
                      //   {...{
                      //     onMouseDown: header.getResizeHandler(),
                      //     onTouchStart: header.getResizeHandler(),
                      //     className: `resizer ${
                      //       header.column.getIsResizing() ? "isResizing" : ""
                      //     }`,
                      //     style: {
                      //       position: "absolute",
                      //       right: 0,
                      //       top: 0,
                      //       height: "100%",
                      //       width: "5px",
                      //       background: "grey",
                      //       cursor: "col-resize",
                      //       userSelect: "none",
                      //       touchAction: "none",
                      //     },
                      //   }}
                      // />
                      null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="w-fit flex h-7" key={row.id}>
              {row.getVisibleCells().map((cell, i) => (
                <td
                  key={cell.id}
                  style={{
                    width: i === 0 ? cell.column.getSize() : "auto",
                    overflowX: "hidden",
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const OperationViewer = ({ operation }: OperationViewerProps) => {
  const treeTheme = useTreeTheme();
  const stringifiedData = JSON.stringify(operation, null, 2);
  console.log(operation);
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
            <Table data={operation?.data} />
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

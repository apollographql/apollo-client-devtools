import { ComponentPropsWithoutRef } from "react";
import { JSONTree } from "react-json-tree";
import { useTreeTheme } from "../theme";

type JSONTreeProps = ComponentPropsWithoutRef<typeof JSONTree>;

type JSONTreeViewerProps = Pick<
  JSONTreeProps,
  "data" | "hideRoot" | "valueRenderer"
>;

export function JSONTreeViewer(props: JSONTreeViewerProps) {
  const treeTheme = useTreeTheme();

  return <JSONTree {...props} invertTheme={false} theme={treeTheme} />;
}

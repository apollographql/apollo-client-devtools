import type { JSONObject } from "../types/json";
import { ObjectViewer } from "./ObjectViewer";

interface Props {
  variables: JSONObject | null | undefined;
}

export function VariablesObject({ variables }: Props) {
  return (
    <ObjectViewer
      value={variables}
      displayObjectSize={false}
      collapsed={false}
    />
  );
}

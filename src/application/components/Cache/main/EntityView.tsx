import { ReactNode } from "react";
import { clsx } from "clsx";

import { JSONObject } from "../../../types/json";
import { JSONTreeViewer } from "../../JSONTreeViewer";

interface EntityViewProps {
  cacheId: string;
  data: JSONObject | undefined;
  setCacheId: (cacheId: string) => void;
}

export function EntityView({ cacheId, data, setCacheId }: EntityViewProps) {
  if (!data) return null;

  return (
    <div className="pt-4 font-code text-sm">
      {cacheId}
      <JSONTreeViewer
        data={data}
        hideRoot={true}
        style={{ marginTop: 0 }}
        valueRenderer={(valueAsString: ReactNode, value, key) => {
          return (
            <span
              className={clsx({
                ["hover:underline hover:cursor-pointer"]: key === "__ref",
              })}
              onClick={() => {
                if (key === "__ref") {
                  setCacheId(value as string);
                }
              }}
            >
              {valueAsString}
            </span>
          );
        }}
      />
    </div>
  );
}

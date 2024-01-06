/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { rem } from "polished";

import { ReactNode } from "react";
import { JSONObject } from "../../../types/json";
import { JSONTreeViewer } from "../../JSONTreeViewer";

const cacheStyles = css`
  padding-top: 1rem;
  font-family: "Source Code Pro", monospace;
  font-size: ${rem(13)};

  > ul {
    margin-top: 0 !important;
    margin-left: ${rem(8)} !important;
  }
`;

interface EntityViewProps {
  cacheId: string;
  data: JSONObject | undefined;
  setCacheId: (cacheId: string) => void;
}

export function EntityView({ cacheId, data, setCacheId }: EntityViewProps) {
  if (!data) return null;

  return (
    <div css={cacheStyles}>
      {cacheId}
      <JSONTreeViewer
        data={data}
        hideRoot={true}
        valueRenderer={(valueAsString: ReactNode, value, key) => {
          return (
            <span
              css={css`
                ${key === "__ref" &&
                css`
                  &:hover {
                    text-decoration: underline;
                    cursor: pointer;
                  }
                `}
              `}
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

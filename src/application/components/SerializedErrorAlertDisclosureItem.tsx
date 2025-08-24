import { gql } from "@apollo/client";
import type { SerializedErrorAlertDisclosureItem_error } from "../types/gql";
import { ErrorAlertDisclosureItem } from "./ErrorAlertDisclosureItem";
import { JSONTreeViewer } from "./JSONTreeViewer";

interface SerializedErrorAlertDisclosureItemProps {
  error: SerializedErrorAlertDisclosureItem_error;
  prefix?: string;
}

export function SerializedErrorAlertDisclosureItem({
  error,
  prefix,
}: SerializedErrorAlertDisclosureItemProps) {
  return (
    <ErrorAlertDisclosureItem>
      <div>
        {prefix && `${prefix}:`} {error.name}: {error.message}
      </div>
      {error.stack && (
        <div className="mt-3">
          <JSONTreeViewer
            className="text-xs"
            data={error.stack.split("\n").slice(1)}
            keyPath={["Stack trace"]}
            theme="alertError"
            shouldExpandNodeInitially={() => false}
          />
        </div>
      )}
    </ErrorAlertDisclosureItem>
  );
}

SerializedErrorAlertDisclosureItem.fragments = {
  error: gql`
    fragment SerializedErrorAlertDisclosureItem_error on ErrorLike {
      message
      name
      stack
    }
  `,
};

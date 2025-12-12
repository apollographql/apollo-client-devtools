import { gql } from "@apollo/client";
import type { SerializedErrorAlertDisclosureItem_error } from "../types/gql";
import { ErrorAlertDisclosureItem } from "./ErrorAlertDisclosureItem";
import { alertErrorTheme, ObjectViewer } from "./ObjectViewer";

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
          <ObjectViewer
            className="mt-4"
            value={error.stack.split("\n").slice(1)}
            displayObjectSize={false}
            size="sm"
            theme={alertErrorTheme}
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

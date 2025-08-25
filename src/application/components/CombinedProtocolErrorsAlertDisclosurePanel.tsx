import gql from "graphql-tag";
import { fragmentRegistry } from "../fragmentRegistry";
import { AlertDisclosure } from "./AlertDisclosure";
import { ErrorAlertDisclosureItem } from "./ErrorAlertDisclosureItem";
import type { CombinedProtocolErrorsAlertDisclosurePanel_error } from "../types/gql";

fragmentRegistry.register(gql`
  fragment CombinedProtocolErrorsAlertDisclosurePanel_error on SerializedCombinedProtocolErrors {
    errors {
      message
    }
  }
`);

export function CombinedProtocolErrorsAlertDisclosurePanel({
  error,
}: {
  error: CombinedProtocolErrorsAlertDisclosurePanel_error;
}) {
  return (
    <AlertDisclosure.Panel>
      <ul className="flex flex-col gap-4">
        {error.errors.map((protocolError, idx) => (
          <ErrorAlertDisclosureItem key={idx}>
            [Protocol]: {protocolError.message}
          </ErrorAlertDisclosureItem>
        ))}
      </ul>
    </AlertDisclosure.Panel>
  );
}

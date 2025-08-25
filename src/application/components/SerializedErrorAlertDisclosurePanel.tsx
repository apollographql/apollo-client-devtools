import { gql } from "@apollo/client";
import { fragmentRegistry } from "../fragmentRegistry";
import { AlertDisclosure } from "./AlertDisclosure";
import { SerializedErrorAlertDisclosureItem } from "./SerializedErrorAlertDisclosureItem";
import { CombinedGraphQLErrorsAlertDisclosurePanel } from "./CombinedGraphQLErrorsAlertDiscloserPanel";
import type { SerializedErrorAlertDisclosurePanel_error } from "@/application/types/gql";

export function SerializedErrorAlertDisclosurePanel({
  error,
}: {
  error: SerializedErrorAlertDisclosurePanel_error;
}) {
  if (error.__typename === "SerializedCombinedGraphQLErrors") {
    return <CombinedGraphQLErrorsAlertDisclosurePanel error={error} />;
  }

  return (
    <AlertDisclosure.Panel>
      <ul>
        <SerializedErrorAlertDisclosureItem error={error} />
      </ul>
    </AlertDisclosure.Panel>
  );
}

fragmentRegistry.register(gql`
  fragment SerializedErrorAlertDisclosurePanel_error on ErrorLike {
    ...CombinedGraphQLErrorsAlertDisclosurePanel_error
    ...SerializedErrorAlertDisclosureItem_error
  }

  ${SerializedErrorAlertDisclosureItem.fragments.error}
`);

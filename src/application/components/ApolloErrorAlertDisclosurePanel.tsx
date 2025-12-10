import { gql } from "@apollo/client";
import type { ApolloErrorAlertDisclosurePanel_error } from "../types/gql";
import { AlertDisclosure } from "./AlertDisclosure";
import { ErrorAlertDisclosureItem } from "./ErrorAlertDisclosureItem";
import { SerializedErrorAlertDisclosureItem } from "./SerializedErrorAlertDisclosureItem";
import { alertErrorTheme, ObjectViewer } from "./ObjectViewer";

interface ApolloErrorAlertDisclosureItemProps {
  error: ApolloErrorAlertDisclosurePanel_error;
}

export function ApolloErrorAlertDisclosurePanel({
  error,
}: ApolloErrorAlertDisclosureItemProps) {
  const { networkError, graphQLErrors, protocolErrors, clientErrors } = error;

  return (
    <AlertDisclosure.Panel>
      <ul className="flex flex-col gap-4">
        {networkError && (
          <SerializedErrorAlertDisclosureItem
            error={networkError}
            prefix="[Network]"
          />
        )}
        {graphQLErrors.map((graphQLError, idx) => {
          const { __typename, message, ...errorDetails } = graphQLError;

          return (
            <ErrorAlertDisclosureItem key={`gql-${idx}`}>
              <div>[GraphQL]: {message}</div>
              <ObjectViewer
                className="mt-4"
                value={errorDetails}
                displayObjectSize={2}
                collapsed={2}
                size="sm"
                theme={alertErrorTheme}
              />
            </ErrorAlertDisclosureItem>
          );
        })}
        {protocolErrors.map((message, idx) => (
          <ErrorAlertDisclosureItem key={`protocol-${idx}`}>
            [Protocol]: {message}
          </ErrorAlertDisclosureItem>
        ))}
        {clientErrors.map((message, idx) => (
          <ErrorAlertDisclosureItem key={`client-${idx}`}>
            [Client]: {message}
          </ErrorAlertDisclosureItem>
        ))}
      </ul>
    </AlertDisclosure.Panel>
  );
}

ApolloErrorAlertDisclosurePanel.fragments = {
  error: gql`
    fragment ApolloErrorAlertDisclosurePanel_error on SerializedApolloError {
      networkError {
        ...SerializedErrorAlertDisclosureItem_error
      }
      clientErrors
      graphQLErrors {
        message
        path
        extensions
      }
      protocolErrors
    }

    ${SerializedErrorAlertDisclosureItem.fragments.error}
  `,
};

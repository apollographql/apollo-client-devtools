import { gql } from "@apollo/client";
import type { ApolloErrorAlertDisclosurePanel_error } from "../types/gql";
import { AlertDisclosure } from "./AlertDisclosure";
import { ErrorAlertDisclosureItem } from "./ErrorAlertDisclosureItem";
import { JSONTreeViewer } from "./JSONTreeViewer";
import { SerializedErrorAlertDisclosureItem } from "./SerializedErrorAlertDisclosureItem";

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
        {graphQLErrors.map((graphQLError, idx) => (
          <ErrorAlertDisclosureItem key={`gql-${idx}`}>
            <div>[GraphQL]: {graphQLError.message}</div>
            {graphQLError.path && (
              <div className="text-xs mt-3">
                path: [
                {graphQLError.path.map((segment, idx, arr) => {
                  return (
                    <>
                      <span className="text-code-g dark:text-code-g-dark">
                        {typeof segment === "number" ? segment : `"${segment}"`}
                      </span>
                      {idx !== arr.length - 1 && ", "}
                    </>
                  );
                })}
                ]
              </div>
            )}
            {graphQLError.extensions && (
              <JSONTreeViewer
                className="mt-4 text-xs"
                data={graphQLError.extensions}
                keyPath={["extensions"]}
                theme="alertError"
              />
            )}
          </ErrorAlertDisclosureItem>
        ))}
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

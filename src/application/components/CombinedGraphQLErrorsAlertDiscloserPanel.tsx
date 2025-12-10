import gql from "graphql-tag";
import { fragmentRegistry } from "../fragmentRegistry";
import { AlertDisclosure } from "./AlertDisclosure";
import { ErrorAlertDisclosureItem } from "./ErrorAlertDisclosureItem";
import type { CombinedGraphQLErrorsAlertDisclosurePanel_error } from "../types/gql";
import { alertErrorTheme, ObjectViewer } from "./ObjectViewer";

fragmentRegistry.register(gql`
  fragment CombinedGraphQLErrorsAlertDisclosurePanel_error on SerializedCombinedGraphQLErrors {
    errors {
      message
      path
      extensions
    }
  }
`);

export function CombinedGraphQLErrorsAlertDisclosurePanel({
  error,
}: {
  error: CombinedGraphQLErrorsAlertDisclosurePanel_error;
}) {
  return (
    <AlertDisclosure.Panel>
      <ul className="flex flex-col gap-4">
        {error.errors.map((graphQLError, idx) => {
          const { __typename, message, ...errorDetails } = graphQLError;

          return (
            <ErrorAlertDisclosureItem key={idx}>
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
      </ul>
    </AlertDisclosure.Panel>
  );
}

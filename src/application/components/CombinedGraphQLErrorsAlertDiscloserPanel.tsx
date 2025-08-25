import gql from "graphql-tag";
import { fragmentRegistry } from "../fragmentRegistry";
import { AlertDisclosure } from "./AlertDisclosure";
import { ErrorAlertDisclosureItem } from "./ErrorAlertDisclosureItem";
import type { CombinedGraphQLErrorsAlertDisclosurePanel_error } from "../types/gql";
import { JSONTreeViewer } from "./JSONTreeViewer";

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
        {error.errors.map((graphQLError, idx) => (
          <ErrorAlertDisclosureItem key={idx}>
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
      </ul>
    </AlertDisclosure.Panel>
  );
}

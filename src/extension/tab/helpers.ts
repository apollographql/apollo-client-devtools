import type { ApolloClient as ApolloClient4 } from "@apollo/client";
import type { ApolloClient as ApolloClient3 } from "@apollo/client-3";
import type { ApolloClient } from "@/types";
import type {
  DocumentNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql";
import { gte } from "semver";
import { ClientV4Handler } from "./v4/handler";
import { ClientV3Handler } from "./v3/handler";

export function createHandler(client: ApolloClient) {
  return gte(client.version, "4.0.0")
    ? new ClientV4Handler(client as ApolloClient4)
    : new ClientV3Handler(client as ApolloClient3<any>);
}

export function getMainDefinition(
  queryDoc: DocumentNode
): OperationDefinitionNode | FragmentDefinitionNode {
  let fragmentDefinition;

  for (const definition of queryDoc.definitions) {
    if (definition.kind === "OperationDefinition") {
      const operation = (definition as OperationDefinitionNode).operation;
      if (
        operation === "query" ||
        operation === "mutation" ||
        operation === "subscription"
      ) {
        return definition as OperationDefinitionNode;
      }
    }
    if (definition.kind === "FragmentDefinition" && !fragmentDefinition) {
      // we do this because we want to allow multiple fragment definitions
      // to precede an operation definition.
      fragmentDefinition = definition as FragmentDefinitionNode;
    }
  }

  if (fragmentDefinition) {
    return fragmentDefinition;
  }

  throw new Error(
    "Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment."
  );
}

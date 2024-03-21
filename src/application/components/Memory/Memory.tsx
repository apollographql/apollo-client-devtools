import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { FullWidthLayout } from "../Layouts/FullWidthLayout";
import type {
  GetMemoryInternals,
  GetMemoryInternalsVariables,
} from "../../types/gql";

const GET_MEMORY_INTERNALS: TypedDocumentNode<
  GetMemoryInternals,
  GetMemoryInternalsVariables
> = gql`
  query GetMemoryInternals {
    memoryInternals @client
  }
`;

export const Memory = () => {
  const { loading, data, error } = useQuery(GET_MEMORY_INTERNALS, {
    pollInterval: 1000,
  });
  return (
    <FullWidthLayout>
      <div className="h-full">
        <h1>Memory</h1>
        <pre className="overflow-y-auto">
          {JSON.stringify({ loading, data, error }, undefined, 2)}
        </pre>
      </div>
    </FullWidthLayout>
  );
};

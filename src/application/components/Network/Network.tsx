import { TypedDocumentNode, useQuery, gql } from "@apollo/client";
import { useMemo } from "react";
import { GetNetwork, GetNetworkVariables } from "../../types/gql";

const GET_NETWORK: TypedDocumentNode<GetNetwork, GetNetworkVariables> = gql`
  query GetNetwork {
    network @client
  }
`;

export function Network() {
  const { loading, data } = useQuery(GET_NETWORK);
  const network = useMemo(
    () => (data?.network ? (JSON.parse(data.network) as Cache) : {}),
    [data?.network]
  );

  return "hi";
}

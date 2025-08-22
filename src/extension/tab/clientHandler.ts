import type { ApolloClient as ApolloClient4 } from "@apollo/client";
import type { ApolloClient as ApolloClient3 } from "@apollo/client-3";
import type { MutationDetails } from "./v3/types";

export abstract class ClientHandler<
  TClient extends ApolloClient3<any> | ApolloClient4,
> {
  client: TClient;

  constructor(client: TClient) {
    this.client = client;
  }

  abstract getMutations(): TClient extends ApolloClient3<any>
    ? MutationDetails[]
    : never;
}

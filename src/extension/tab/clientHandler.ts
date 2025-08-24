import type { ApolloClient as ApolloClient4 } from "@apollo/client";
import type { ApolloClient as ApolloClient3 } from "@apollo/client-3";
import type { MutationDetails } from "./v3/types";
import type { WithPrivateAccess } from "@/privateAccess";
import { getPrivateAccess } from "@/privateAccess";
import { createId } from "../../utils/createId";

export abstract class ClientHandler<
  TClient extends ApolloClient3<any> | ApolloClient4,
> {
  readonly id: string;
  protected readonly client: WithPrivateAccess<TClient>;

  constructor(client: TClient) {
    this.id = createId();
    this.client = getPrivateAccess(client);
  }

  get version() {
    return this.client.version;
  }

  getClient() {
    return this.client as unknown as TClient;
  }

  abstract getMutations(): TClient extends ApolloClient3<any>
    ? MutationDetails[]
    : never[];
}

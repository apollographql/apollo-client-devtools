import type { ApolloClient } from "@apollo/client";
import { ClientHandler } from "../clientHandler";

export class ClientV4Handler extends ClientHandler<ApolloClient> {
  getMutations(): never[] {
    return [];
  }
}

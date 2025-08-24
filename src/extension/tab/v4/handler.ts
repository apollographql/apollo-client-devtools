import type { ApolloClient } from "@apollo/client";
import { ClientHandler } from "../clientHandler";
import type { MutationV4Details } from "./types";

export class ClientV4Handler extends ClientHandler<ApolloClient> {
  getMutations(): MutationV4Details[] {
    return [];
  }
}

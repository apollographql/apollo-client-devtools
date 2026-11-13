import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import {
  ApolloClient as ApolloClient3,
  ApolloLink as ApolloLink3,
  InMemoryCache as InMemoryCache3,
  Observable as Observable3,
} from "@apollo/client-3";
import type { IntrospectionQuery } from "graphql";
import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  graphqlSync,
  parse,
  print,
} from "graphql";
import { firstValueFrom, Observable } from "rxjs";
import type { EmbeddedExplorerResponse } from "@/types";
import type { ClientHandler } from "../clientHandler";
import { ClientV3Handler } from "../v3/handler";
import { ClientV4Handler } from "../v4/handler";

const schema = buildSchema(`
  type Query {
    greeting(name: String): String
  }
`);

// Executes against a real schema, so an operation the server could not accept,
// such as one that still carries a client-only directive, comes back as errors.
function executeAgainstSchema(query: Parameters<typeof print>[0]) {
  return graphqlSync({ schema, source: print(query) });
}

function createClientV4(dataMasking: boolean) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    dataMasking,
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          observer.next(executeAgainstSchema(operation.query) as never);
          observer.complete();
        })
    ),
  });
}

function createClientV3(dataMasking: boolean) {
  return new ApolloClient3({
    cache: new InMemoryCache3(),
    dataMasking,
    link: new ApolloLink3(
      (operation) =>
        new Observable3((observer) => {
          observer.next(executeAgainstSchema(operation.query) as never);
          observer.complete();
        })
    ),
  });
}

function runIntrospection(handler: ClientHandler<any>) {
  return firstValueFrom(
    handler.executeOperation({
      clientId: handler.id,
      operation: parse(getIntrospectionQuery()),
      operationName: "IntrospectionQuery",
      variables: undefined,
      fetchPolicy: "no-cache",
    } as Parameters<ClientHandler<any>["executeOperation"]>[0])
  ) as Promise<{ response: EmbeddedExplorerResponse }>;
}

describe.each([
  ["v4", (masking: boolean) => new ClientV4Handler(createClientV4(masking))],
  ["v3", (masking: boolean) => new ClientV3Handler(createClientV3(masking))],
])("introspection through the %s client handler", (_, createHandler) => {
  it.each([[true], [false]])(
    "returns a usable schema when dataMasking is %s",
    async (dataMasking) => {
      const { response } = await runIntrospection(createHandler(dataMasking));

      expect(response.errors).toBeUndefined();
      expect(response.error).toBeUndefined();

      const clientSchema = buildClientSchema(
        response.data as unknown as IntrospectionQuery
      );

      expect(Object.keys(clientSchema.getQueryType()!.getFields())).toEqual([
        "greeting",
      ]);
    }
  );
});

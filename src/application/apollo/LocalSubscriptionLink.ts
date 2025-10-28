import { ApolloLink, Observable } from "@apollo/client";
import { subscribe } from "graphql";
import type { GraphQLSchema } from "graphql";

interface LocalSubscriptionLinkOptions {
  schema: GraphQLSchema;
}

export class LocalSubscriptionLink extends ApolloLink {
  private schema: GraphQLSchema;

  constructor(options: LocalSubscriptionLinkOptions) {
    super();
    this.schema = options.schema;
  }

  request(operation: ApolloLink.Operation): Observable<ApolloLink.Result> {
    return new Observable((observer) => {
      subscribe({
        schema: this.schema,
        document: operation.query,
        operationName: operation.operationName,
        variableValues: operation.variables,
      }).then(async (result) => {
        if (isAsyncIterable(result)) {
          for await (const value of result) {
            observer.next(value);
          }
        } else {
          observer.next(result);
        }

        observer.complete();
      });
    });
  }
}

function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
  return typeof value?.[Symbol.asyncIterator] === "function";
}

import type {
  ApolloClient as ApolloClient4,
  DocumentNode,
  Observable as ObservableV4,
} from "@apollo/client";
import type {
  ApolloClient as ApolloClient3,
  Observable as ObservableV3,
} from "@apollo/client-3";
import type { WithPrivateAccess } from "@/privateAccess";
import { getPrivateAccess } from "@/privateAccess";
import { createId } from "../../utils/createId";
import type { MutationV3Details, QueryV3Details } from "./v3/types";
import type { MutationV4Details, QueryV4Details } from "./v4/types";
import type { ActorMessage } from "../actor";
import type { EmbeddedExplorerResponse, ExplorerResponse } from "@/types";
import { Observable } from "rxjs";
import { EMPTY, from, map, of } from "rxjs";
import { filterDocumentForOperation } from "@/utils/graphql";
import { getOperationDefinition } from "@apollo/client/utilities/internal";
import { OperationTypeNode } from "graphql";
import type { JSONObject } from "@/application/types/json";

export type IDv3 = string & { __version?: "v3" };
export type IDv4 = string & { __version?: "v4" };

type ExplorerRequest = Extract<
  ActorMessage,
  { type: "explorerRequest" }
>["payload"];
export type FetchPolicy = ExplorerRequest["fetchPolicy"];

export abstract class ClientHandler<
  TClient extends ApolloClient3<any> | ApolloClient4,
> {
  readonly id: TClient extends ApolloClient3<any> ? IDv3 : IDv4;
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

  executeOperation(payload: ExplorerRequest): Observable<ExplorerResponse> {
    const { operation, operationName, variables } = payload;
    const document = filterDocumentForOperation(operation, operationName);
    const definition = getOperationDefinition(document);

    if (!definition) {
      return EMPTY;
    }

    if (operationName === "IntrospectionQuery") {
      return from(
        this.executeQuery({ query: document, fetchPolicy: "no-cache" }).then(
          (response) => ({ operationName, response })
        )
      );
    }

    if (definition.operation === OperationTypeNode.MUTATION) {
      return from(
        this.executeMutation({ mutation: document, variables }).then(
          (response) => ({ operationName, response })
        )
      );
    }

    if (definition.operation === OperationTypeNode.SUBSCRIPTION) {
      return wrapObservable(
        this.executeSubscription({ subscription: document, variables })
      ).pipe(map((response) => ({ operationName, response })));
    }

    return wrapObservable(
      this.watchQuery({
        query: document,
        variables,
        fetchPolicy: payload.fetchPolicy,
      })
    ).pipe(map((response) => ({ operationName, response })));
  }

  protected abstract executeQuery(options: {
    query: DocumentNode;
    variables?: JSONObject | undefined;
    fetchPolicy?: FetchPolicy;
  }): TClient extends ApolloClient4
    ? Promise<EmbeddedExplorerResponse>
    : Promise<EmbeddedExplorerResponse>;

  protected abstract watchQuery(options: {
    query: DocumentNode;
    variables: JSONObject | undefined;
    fetchPolicy: FetchPolicy;
  }): TClient extends ApolloClient4
    ? ObservableV4<EmbeddedExplorerResponse>
    : ObservableV3<EmbeddedExplorerResponse>;

  protected abstract executeMutation(options: {
    mutation: DocumentNode;
    variables: JSONObject | undefined;
  }): TClient extends ApolloClient4
    ? Promise<EmbeddedExplorerResponse>
    : Promise<EmbeddedExplorerResponse>;

  protected abstract executeSubscription(options: {
    subscription: DocumentNode;
    variables: JSONObject | undefined;
  }): TClient extends ApolloClient4
    ? ObservableV4<EmbeddedExplorerResponse>
    : ObservableV3<EmbeddedExplorerResponse>;

  abstract getMutations(): TClient extends ApolloClient3<any>
    ? MutationV3Details[]
    : MutationV4Details[];

  abstract getQueries(): TClient extends ApolloClient3<any>
    ? QueryV3Details[]
    : QueryV4Details[];
}

function wrapObservable<T>(
  inner: ObservableV3<T> | ObservableV4<T>
): Observable<T> {
  return new Observable((observer) => {
    const subscription = inner.subscribe(observer);

    return () => subscription.unsubscribe();
  });
}

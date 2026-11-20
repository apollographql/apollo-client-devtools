import { ApolloClient, ApolloLink, InMemoryCache, gql } from "@apollo/client";
import { EMPTY, Subject } from "rxjs";
import type { ExplorerResponse } from "@/types";
import { createTestSource } from "@/testUtils/createTestSource";
import { createActor } from "../../actor";
import { MessageAdapter } from "../../messageAdapters";
import { handleExplorerRequests } from "../handleExplorerRequests";
import { ClientV4Handler } from "../v4/handler";

it.each(["complete", "terminate", "abort"] as const)(
  "releases Explorer listeners when an active operation ends via %s",
  (end) => {
    const source = createTestSource();
    const actor = createActor(new MessageAdapter(source));
    const on = jest.spyOn(actor, "on");
    const controller = new AbortController();
    const remove = jest.spyOn(controller.signal, "removeEventListener");
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ApolloLink.empty(),
    });
    const handler = new ClientV4Handler(client);
    const operation = new Subject<ExplorerResponse>();
    jest
      .spyOn(handler, "executeOperation")
      .mockReturnValueOnce(EMPTY)
      .mockReturnValueOnce(operation);
    const stopHandling = handleExplorerRequests(actor, () => handler, {
      signal: controller.signal,
    });
    const request = {
      type: "explorerRequest",
      payload: {
        clientId: "client",
        operation: gql`
          query {
            greeting
          }
        `,
        operationName: undefined,
        variables: undefined,
        fetchPolicy: "no-cache",
      },
    } as const;
    source.simulateActorMessage(request);
    expect(on).toHaveBeenCalledTimes(1); // Only the request listener for EMPTY.
    source.simulateActorMessage(request);
    const [, stop] = on.mock.calls[1];
    expect(operation.observed).toBe(true);
    if (end === "complete") operation.complete();
    if (end === "terminate")
      source.simulateActorMessage({ type: "explorerSubscriptionTermination" });
    if (end === "abort") controller.abort();
    expect(operation.observed).toBe(false);
    expect(remove).toHaveBeenCalledWith("abort", stop);
    stopHandling();
    expect(source.mocks.removeListener).toHaveBeenCalled();
    client.stop();
  }
);

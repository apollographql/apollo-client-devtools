import type { Actor, ActorMessage } from "@/extension/actor";

export function getMessageStream<TName extends ActorMessage["type"]>(
  name: TName,
  actor: Actor,
  signal?: AbortSignal
): Extract<ActorMessage, { type: TName }> extends infer Message
  ? ReadableStream<Message>
  : never {
  return new ReadableStream({
    start(controller) {
      if (signal?.aborted) {
        return controller.close();
      }

      const unsubscribe = actor.on(name, ((message: unknown) => {
        controller.enqueue(message);
      }) as any);

      signal?.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    },
  }) as any;
}

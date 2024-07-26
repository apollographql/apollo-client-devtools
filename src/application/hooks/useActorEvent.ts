/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useLayoutEffect, useRef } from "react";
import { getPanelActor } from "../../extension/devtools/panelActor";
import type { ActorMessage } from "../../extension/actor";

export function useActorEvent<TName extends ActorMessage["type"]>(
  name: TName,
  callback: Extract<ActorMessage, { type: TName }> extends infer Message
    ? (message: Message) => void
    : never
) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    return getPanelActor(window).on(name, ((message: unknown) => {
      callbackRef.current(message);
    }) as any);
  }, [name]);
}

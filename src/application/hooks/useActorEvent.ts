/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useLayoutEffect, useRef } from "react";
import { getPanelActor } from "../../extension/devtools/panelActor";
import type { EventMessage } from "../../extension/actor";

export function useActorEvent<TName extends EventMessage["type"]>(
  name: TName,
  callback: Extract<EventMessage, { type: TName }> extends infer Message
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

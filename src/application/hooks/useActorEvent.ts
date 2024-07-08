/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useLayoutEffect, useRef } from "react";
import type { PanelMessage } from "../../extension/messages";
import { getPanelActor } from "../../extension/devtools/panelActor";

export function useActorEvent<TName extends PanelMessage["type"]>(
  name: TName,
  callback: Extract<PanelMessage, { type: TName }> extends infer Message
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

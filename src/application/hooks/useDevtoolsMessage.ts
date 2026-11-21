import { useEffect, useEffectEvent } from "react";
import type { DevtoolsMessage, MessageType } from "@/extension/messages";
import { panelMessageAdapter } from "@/extension/devtools/panelTransport";

export function useDevtoolsMessage<Type extends MessageType>(
  type: Type,
  callback: Extract<DevtoolsMessage, { type: Type }> extends infer Message
    ? (message: Message) => void
    : never
) {
  const stableCallback = useEffectEvent(callback);

  useEffect(() => {
    return panelMessageAdapter.on(type, (message: unknown) => {
      stableCallback(message);
    });
  }, [type]);
}

import type { MemoryInternals } from "../../application/types/scalars";
import type { Actor } from "../actor";
import { createWindowActor } from "../actor";
import { createWindowMessageAdapter } from "../messageAdapters";
import type { PanelMessage } from "../messages";
import type { RpcClient } from "../rpc";
import { createRpcClient } from "../rpc";

export type PanelRpcMessages = {
  getMemoryInternals: () => undefined | MemoryInternals;
};

let panelActor: Actor<PanelMessage> | null = null;
let panelRpc: RpcClient<PanelRpcMessages> | null = null;

export const getPanelActor = (window: Window) => {
  return (panelActor ||= createWindowActor<PanelMessage>(window));
};

export const getPanelRpc = (window: Window) => {
  return (panelRpc ||= createRpcClient(createWindowMessageAdapter(window)));
};

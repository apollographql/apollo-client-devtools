import type { Actor } from "../actor";
import { createActor } from "../actor";
import { panelMessageAdapter } from "./panelTransport";

let panelActor: Actor | null = null;

export const getPanelActor = () => {
  return (panelActor ||= createActor(panelMessageAdapter));
};

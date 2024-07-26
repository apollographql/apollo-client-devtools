import type { Actor } from "../actor";
import { createWindowActor } from "../actor";

let panelActor: Actor | null = null;

export const getPanelActor = (window: Window) => {
  return (panelActor ||= createWindowActor(window));
};

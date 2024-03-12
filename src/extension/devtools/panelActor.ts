import type { Actor} from "../actor";
import { createWindowActor } from "../actor";
import type { PanelMessage } from "../messages";

let panelActor: Actor<PanelMessage> | null = null;

export const getPanelActor = (window: Window) => {
  return (panelActor ||= createWindowActor<PanelMessage>(window));
};

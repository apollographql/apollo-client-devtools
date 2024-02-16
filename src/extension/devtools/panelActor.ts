import { Actor, createWindowActor } from "../actor";
import { PanelMessage } from "../messages";

let panelActor: Actor<PanelMessage> | null = null;

export const getPanelActor = (window: Window) => {
  return (panelActor ||= createWindowActor<PanelMessage>(window));
};

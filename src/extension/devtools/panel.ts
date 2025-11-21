import { forwardDevToolsActorEvent } from "../../application";
import "./panel.css";
import { getPanelActor } from "./panelActor";

forwardDevToolsActorEvent(getPanelActor(window), [
  "initializePanel",
  "extensionInvalidated",
  "port.changed",
]);

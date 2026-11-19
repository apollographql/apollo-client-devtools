import { forwardDevToolsActorEvent } from "../../application";
import "./panel.css";
import { getPanelActor } from "./panelActor";

forwardDevToolsActorEvent(getPanelActor(), ["initializePanel", "port.changed"]);

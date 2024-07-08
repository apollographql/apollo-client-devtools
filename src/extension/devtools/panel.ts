import { initDevTools } from "../../application";
import "./panel.css";
import { getPanelActor } from "./panelActor";

getPanelActor(window).on("initializePanel", initDevTools);

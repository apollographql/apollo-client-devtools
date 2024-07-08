import { initDevTools } from "../../application";
import "./panel.css";
import { getPanelActor } from "./panelActor";

const panelWindow = getPanelActor(window);

panelWindow.on("initializePanel", initDevTools);

// panelWindow.on("clientTerminated", (message) => {
//   removeClient(message.clientId);
// });

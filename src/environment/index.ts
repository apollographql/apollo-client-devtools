import { initDevtoolsPanel } from "./initialize/panel";
import { initInspectedWindow } from "./initialize/inspected";

// Create the initial Apollo devtools panel.
initDevtoolsPanel();

// Prepare the inspected window (the application being inspected) for use
// with devtools.
initInspectedWindow();

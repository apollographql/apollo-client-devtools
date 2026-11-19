import { createMessagePortMessageAdapter } from "../messageAdapters";

export interface PanelWindow extends Window {
  connectApolloPanel: () => MessagePort;
}

const { port1, port2 } = new MessageChannel();

// The panel loads before onShown supplies its window to devtools.ts.
// Returning the other endpoint directly avoids a window-message bootstrap.
Object.assign(window, { connectApolloPanel: () => port2 });

export const panelMessageAdapter = createMessagePortMessageAdapter(port1);

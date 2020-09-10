import { initDevTools, writeData } from "../../application";
import { receiveGraphiQLRequests, sendResponseToGraphiQL } from "../../application/Explorer/graphiQLRelay";

(window as any).__DEVTOOLS_APPLICATION__ = {
  initialize: initDevTools,
  writeData,
  receiveGraphiQLRequests,
  sendResponseToGraphiQL,
};

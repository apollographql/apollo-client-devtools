import { initDevTools, writeData } from "../../application";

(window as any).__DEVTOOLS_APPLICATION__ = {
  initialize: initDevTools,
  writeData,
};

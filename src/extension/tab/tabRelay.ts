import { createPortActor, createWindowActor } from "../actor";
import browser from "webextension-polyfill";

// eslint-disable-next-line no-async-promise-executor
export default new Promise(async ($export) => {
  const port = browser.runtime.connect({ name: "tab" });

  const tab = createWindowActor(window);
  const devtools = createPortActor(port);

  devtools.proxy("connectToClient", tab);
  devtools.proxy("requestData", tab);
  devtools.proxy("explorerSubscriptionTermination", tab);

  tab.proxy("clientNotFound", devtools);
  tab.proxy("connectToDevtools", devtools);
  tab.proxy("disconnectFromDevtools", devtools);
  tab.proxy("update", devtools);

  // tab.forward(EXPLORER_RESPONSE, `${devtools}:explorer`);

  const module = await Promise.resolve({ tab });
  $export(module);
});

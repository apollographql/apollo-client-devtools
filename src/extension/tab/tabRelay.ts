import { createPortActor, createWindowActor } from "../actor";
import browser from "webextension-polyfill";
import { DevtoolsMessage } from "../messages";

// eslint-disable-next-line no-async-promise-executor
export default new Promise(async ($export) => {
  const port = browser.runtime.connect({ name: "tab" });

  const tab = createWindowActor<DevtoolsMessage>(window);
  const devtools = createPortActor<DevtoolsMessage>(port);

  devtools.forward("connectToClient", tab);
  devtools.forward("requestData", tab);
  devtools.forward("explorerSubscriptionTermination", tab);

  tab.forward("clientNotFound", devtools);
  tab.forward("connectToDevtools", devtools);
  tab.forward("disconnectFromDevtools", devtools);
  tab.forward("update", devtools);

  // tab.forward(EXPLORER_RESPONSE, `${devtools}:explorer`);

  const module = await Promise.resolve({ tab });
  $export(module);
});

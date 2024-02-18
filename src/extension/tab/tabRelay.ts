import { createPortActor, createWindowActor } from "../actor";
import browser from "webextension-polyfill";
import { ClientMessage } from "../messages";

// eslint-disable-next-line no-async-promise-executor
export default new Promise(async ($export) => {
  const tab = createWindowActor<ClientMessage>(window);
  const devtools = createPortActor<ClientMessage>(
    browser.runtime.connect({ name: "tab" })
  );

  devtools.forward("connectToClient", tab);
  devtools.forward("requestData", tab);
  devtools.forward("explorerSubscriptionTermination", tab);
  devtools.forward("explorerRequest", tab);

  tab.forward("clientNotFound", devtools);
  tab.forward("connectToDevtools", devtools);
  tab.forward("disconnectFromDevtools", devtools);
  tab.forward("update", devtools);
  tab.forward("explorerResponse", devtools);

  const module = await Promise.resolve({ tab });
  $export(module);
});

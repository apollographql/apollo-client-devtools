import browser from "webextension-polyfill";
import { createBackgroundRouter } from "./router";

const router = createBackgroundRouter();
browser.runtime.onConnect.addListener(router.onConnect);

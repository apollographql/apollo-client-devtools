// This script is injected into each tab.
import "./tabRelay"; 
import { initializeHook } from "./hook";
import { version as devToolsVersion } from "../manifest.json";

/* 
  Content scripts are unable to modify the window object directly. 
  A common workaround for this issue is to inject an inlined function
  into the inspected tab.
*/ 
if (typeof document === "object" && document instanceof HTMLDocument) {
  const script = document.createElement("script");
  script.textContent = `;(${initializeHook.toString()})(window, "${devToolsVersion}")`;
  document.documentElement.appendChild(script);
  script?.parentNode?.removeChild(script);
}

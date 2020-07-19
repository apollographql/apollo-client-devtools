// This script is injected into every page.
import { initializeHook } from "./hook";
import { version as devToolsVersion } from "../manifest.json";

if (document instanceof HTMLDocument) {
  const script = document.createElement("script");
  script.textContent = `;(${initializeHook.toString()})(window, "${devToolsVersion}")`;
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

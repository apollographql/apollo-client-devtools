// This script is injected into every page.
import { installHook } from "src/backend/hook";
import { version as devToolsVersion } from "../manifest.json";

// inject the hook
if (document instanceof HTMLDocument) {
  const script = document.createElement("script");
  script.textContent = `;(${installHook.toString()})(window, "${devToolsVersion}")`;
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
}

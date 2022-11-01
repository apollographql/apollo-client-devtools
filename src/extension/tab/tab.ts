// This script is injected into each tab.
import "./tabRelay"; 

/* 
  Content scripts are unable to modify the window object directly. 
  A common workaround for this issue is to inject an inlined function
  into the inspected tab.
*/ 
if (typeof document === "object" && document instanceof HTMLDocument) {
  const script = document.createElement("script");
  script.setAttribute("type", "module");
  script.setAttribute("src", chrome.extension.getURL("hook.js"));
  document.addEventListener("DOMContentLoaded", () => {
    const importMap = document.querySelector("script[type=\"importmap\"]");
    if (importMap != null) {
      importMap.parentNode?.insertBefore(script, importMap.nextSibling);
    } else {
      const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
      head.insertBefore(script, head.lastChild);
    }
  });
}

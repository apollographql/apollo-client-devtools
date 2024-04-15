declare const __IS_FIREFOX__: boolean;

// Firefox doesn't support ExecutionWorld.MAIN yet so we do the injection in
// tab.js instead.
const scripts: chrome.scripting.RegisteredContentScript[] = __IS_FIREFOX__
  ? [
      {
        id: "@apollo-devtools/tab",
        matches: ["<all_urls>"],
        js: ["tab.js"],
        runAt: "document_start",
      },
    ]
  : [
      {
        id: "@apollo-devtools/tab",
        matches: ["<all_urls>"],
        js: ["tab.js"],
        runAt: "document_start",
        world: "ISOLATED",
      },
      {
        id: "@apollo-devtools/hook",
        matches: ["<all_urls>"],
        js: ["hook.js"],
        runAt: "document_start",
        world: "MAIN",
      },
    ];

async function dynamicallyInjectContentScripts() {
  try {
    await chrome.scripting.unregisterContentScripts();
    await chrome.scripting.registerContentScripts(scripts);
  } catch (e) {
    console.error(e);
  }
}

dynamicallyInjectContentScripts();

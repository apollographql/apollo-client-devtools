export function initDevtoolsPanel() {
  // Create the initial devtools panel that will hold the Apollo Client
  // Devtools application.
  chrome.devtools.panels.create(
    "Apollo",
    "/app/icons/128.png",
    "/app/index.html",
  );
}

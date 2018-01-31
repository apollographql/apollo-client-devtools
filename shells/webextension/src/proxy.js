// This is a content-script that is injected only when the devtools are
// activated. Because it is not injected using eval, it has full privilege
// to the chrome runtime API. It serves as a proxy between the injected
// backend and the Apollo devtools panel.

const port = chrome.runtime.connect({ name: "content-script" });

function sendMessageToBackend(payload) {
  window.postMessage(
    { source: "apollo-devtools-proxy", payload: payload },
    "*",
  );
}

function sendMessageToDevtools(e) {
  if (e.data && e.data.source === "apollo-devtools-backend") {
    port.postMessage(e.data.payload);
  }
}

function handleDisconnect() {
  window.removeEventListener("message", sendMessageToDevtools);
  sendMessageToBackend("shutdown");
}

port.onMessage.addListener(sendMessageToBackend);
window.addEventListener("message", sendMessageToDevtools);
port.onDisconnect.addListener(handleDisconnect);

sendMessageToBackend("init");

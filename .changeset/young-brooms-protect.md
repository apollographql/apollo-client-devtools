---
"apollo-client-devtools": patch
---

Use `Object.defineProperty` to register legacy clients to avoid the need to search for the client in a loop in initialization.

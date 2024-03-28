---
"apollo-client-devtools": patch
---

Fix issue where terminating the client by calling `.stop` would not disconnect it from devtools making it difficult to track newly created clients.

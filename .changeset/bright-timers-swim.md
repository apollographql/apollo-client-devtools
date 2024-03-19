---
"apollo-client-devtools": patch
---

Refactor call to connect to the client instance into an RPC call. This removes 3 distinct messages to connect to the client initially into a single RPC call.

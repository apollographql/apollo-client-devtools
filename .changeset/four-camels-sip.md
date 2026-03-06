---
"apollo-client-devtools": patch
---

Execute queries initiated by the "Explorer" tab with an `errorPolicy` of `all` to prevent unhandled rejection errors when the query returned an error.

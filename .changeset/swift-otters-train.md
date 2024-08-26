---
"apollo-client-devtools": patch
---

Always JSON serialize payloads sent from the injected script to avoid issues cloning irregular objects in client data.

---
"apollo-client-devtools": patch
---

Fix issue with error serialization when sending an error back through the message passing system. Unfortunately the raw error instance was lost in this process. This fix retains the error message when sending error messages in rpc calls.

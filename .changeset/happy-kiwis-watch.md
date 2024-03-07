---
"apollo-client-devtools": patch
---

Don't `JSON.stringify` the Apollo Client instance data before sending it in the message payload when communicating between the various parts of the devtools extension. This was mostly redundant since message passing already relies on the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

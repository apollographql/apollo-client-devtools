---
"apollo-client-devtools": patch
---

Fix an issue when sending cache data from the browser to the extension. This was particularly problematic when the cache contained `URL` instances which are not cloneable via the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)

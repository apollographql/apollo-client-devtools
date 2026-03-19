---
"apollo-client-devtools": patch
---

Replace `isNetworkRequestSettled` import from `@apollo/client/utilities` with an internal util to fix a webpack error when the tab hook is loaded.

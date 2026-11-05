---
"apollo-client-devtools": patch
"@apollo/client-devtools-vscode": patch
---

Fix the devtools losing the connection to Apollo Client after a client-side navigation. Also fix "Client not found" when the devtools are opened after the page has loaded or when the page contains third-party iframes.

---
"apollo-client-devtools": patch
"@apollo/client-devtools-vscode": patch
---

fix calling client.stop twice causing app crashing by checking if handler exist before sending tab command

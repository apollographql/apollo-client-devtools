---
"apollo-client-devtools": patch
---

Remove action-hook-fired event that was triggered with nothing listening. This change meant that the `__actionHookForDevTools` callback did nothing. This has now been disabled to avoid adding an extra `onBroadcast` listener on the client.

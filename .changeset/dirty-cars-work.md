---
"apollo-client-devtools": minor
---

Rework the message passing between all areas of the devtools to provide more stability. In particular, the message passing has changed in the following ways:

- All messages now contain a `source` property set to `apollo-client-devtools`. This avoids potential clashes with events emitted from `window` that had nothing to do with the devtools. This also means that apps or other utilities that listen to messages on `window` know where the message originates.
- Strengthen the relationship in the background scripts between the tab and devtools ports.
- Add much better type safety for all messages sent through the various areas of the devtools.

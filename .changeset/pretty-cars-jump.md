---
"apollo-client-devtools": patch
---

Revert change that removed JSON stringify on the entire set of client data. This is a followup to [#1259](https://github.com/apollographql/apollo-client-devtools/pull/1259) which only partially fixed the issue.

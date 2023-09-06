---
"apollo-client-devtools": patch
---

Improve searching the cache by filtering the list of cache ids that match the search term and highlight the matched substring. This change removes the matching against the cache values as that was difficult to determine why a match occurred.

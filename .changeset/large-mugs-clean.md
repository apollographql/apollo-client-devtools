---
"apollo-client-devtools": patch
---

Ensure `SerializedApolloError.graphqlErrors` falls back to an empty array if its value is set to `null` to prevent GraphQL errors.

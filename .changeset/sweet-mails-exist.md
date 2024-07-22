---
"apollo-client-devtools": minor
---

Add support for inspecting multiple clients. When multiple clients connect to devtools, you can select which to inspect. When combined with Apollo Client [3.11](https://github.com/apollographql/apollo-client/releases/tag/v3.11.0), you can provide a custom name using the new `devtools` option.

```js
new ApolloClient({
  devtools: {
    enabled: true,
    name: "My Custom Client",
  },
});
```

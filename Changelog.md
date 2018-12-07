# Changelog (started at 2.1.0)

## 2.1.6

* Removed https://devtools.apollodata.com/graphql from the content security
  policy section of `manifest.json`, since it doesn't need to be referenced
  based on how that endpoint is being used. Removing it helps with
  Firefox's security review process. <br/>
  [@hwillson](https://github.com/hwillson) in [#156](https://github.com/apollographql/apollo-client-devtools/pull/156)
* Fix to address issues caused by internal initial state not being set
  properly, due to trying to access the Apollo Client `queryManager` when
  it hasn't finished initializing. <br/>
  [@adampetrie](https://github.com/adampetrie) in [#139](https://github.com/apollographql/apollo-client-devtools/pull/139)

## 2.1.5

* Fixes a query name parsing issue that lead to a blank page showing when
  viewing the queries panel. <br/>
  [@hwillson](https://github.com/hwillson) in [#149](https://github.com/apollographql/apollo-client-devtools/pull/149)

## 2.1.4

* Removed all Google Analytics tracking. <br/>
  [@hwillson](https://github.com/hwillson) in [#143](https://github.com/apollographql/apollo-client-devtools/pull/143)
* Change cursor in dark theme to white <br/>
  [@islam3zzat](https://github.com/islam3zzat) in [#131](https://github.com/apollographql/apollo-client-devtools/pull/131)
* Fix issue where "Run in GraphiQL" does not include fragments <br/>
  [@henryqdineen](https://github.com/henryqdineen) in [#133](https://github.com/apollographql/apollo-client-devtools/pull/133)

## 2.1.3

* fixed styling of mutation list
* Allow to use `query.metadata.component.displayName` ([#126](https://github.com/apollographql/apollo-client-devtools/pull/126))
* Fixed mutation run in GraphiQL button ([#127](https://github.com/apollographql/apollo-client-devtools/pull/127))
* Fixed bug where query.queryString did not exist ([#125](https://github.com/apollographql/apollo-client-devtools/pull/125))
* Update vendor GraphiQL styles & fix autocomplete styling ([#123](https://github.com/apollographql/apollo-client-devtools/pull/123))

## 2.1.0

* rebuilt with new architecture
* initial local schema support (when using cache)
* initial subscription support
* improved dark theme

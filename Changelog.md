# Changelog (started at 2.1.0)

## vNext

- Eliminate use of `window.localStorage` ([#118](https://github.com/apollographql/apollo-client-devtools/issues/118), [#142](https://github.com/apollographql/apollo-client-devtools/issues/142))
  [@justinanastos](https://github.com/justinanastos) in [#185](https://github.com/apollographql/apollo-client-devtools/pull/185)

## 2.1.8

- Fix mutations tab crashing devtools ([#182](https://github.com/apollographql/apollo-client-devtools/issues/182))
  [@justinanastos](https://github.com/justinanastos) in [#184](https://github.com/apollographql/apollo-client-devtools/pull/184)

## 2.1.7

- Removed https://devtools.apollodata.com/graphql from the content security
  policy section of `manifest.json`, since it doesn't need to be referenced
  based on how that endpoint is being used. Removing it helps with
  Firefox's security review process. <br/>
  [@hwillson](https://github.com/hwillson) in [#156](https://github.com/apollographql/apollo-client-devtools/pull/156)
- Fix to address issues caused by internal initial state not being set
  properly, due to trying to access the Apollo Client `queryManager` when
  it hasn't finished initializing. <br/>
  [@adampetrie](https://github.com/adampetrie) in [#139](https://github.com/apollographql/apollo-client-devtools/pull/139)
- Fix outdated client message
  <br>
  [@jonas-arkulpa](https://github.com/jonas-arkulpa)
  in [#157](https://github.com/apollographql/apollo-client-devtools/pull/157)
- Prepare to publish to npm (add README for npm and add version to package.json) ([#160](https://github.com/apollographql/apollo-client-devtools/issues/160))
  <br>
  [@cheapsteak](https://github.com/cheapsteak)
  in [#167](https://github.com/apollographql/apollo-client-devtools/pull/167)
- Adding code necessary for React Native support ([#160](https://github.com/apollographql/apollo-client-devtools/issues/160))
  <br>
  [@Gongreg](https://github.com/Gongreg)
  in [#165](https://github.com/apollographql/apollo-client-devtools/pull/165)
- Publish built extension (dist/) ([#169](https://github.com/apollographql/apollo-client-devtools/issues/169))
  <br>
  [@cheapsteak](https://github.com/cheapsteak)
  in [#170](https://github.com/apollographql/apollo-client-devtools/pull/170)
- Make prettier more developer-friendly
  <br>
  [@justinanastos](https://github.com/justinanastos)
  in [#178](https://github.com/apollographql/apollo-client-devtools/pull/178)
- Add sourcemaps to build
  <br>
  [@justinanastos](https://github.com/justinanastos)
  in [#179](https://github.com/apollographql/apollo-client-devtools/pull/179)
- Fix empty cache crashing cache inspector ([#107](https://github.com/apollographql/apollo-client-devtools/issues/107))
  <br>
  [@justinanastos](https://github.com/justinanastos)
  in [#177](https://github.com/apollographql/apollo-client-devtools/pull/177)
- Fix GraphiQL Documentation Explorer crashing with client schema extensions ([#107](https://github.com/apollographql/apollo-client-devtools/issues/107))
  <br>
  [@justinanastos](https://github.com/justinanastos)
  in [#180](https://github.com/apollographql/apollo-client-devtools/pull/180)

## 2.1.5

- Fixes a query name parsing issue that lead to a blank page showing when
  viewing the queries panel. <br/>
  [@hwillson](https://github.com/hwillson) in [#149](https://github.com/apollographql/apollo-client-devtools/pull/149)

## 2.1.4

- Removed all Google Analytics tracking. <br/>
  [@hwillson](https://github.com/hwillson) in [#143](https://github.com/apollographql/apollo-client-devtools/pull/143)
- Change cursor in dark theme to white <br/>
  [@islam3zzat](https://github.com/islam3zzat) in [#131](https://github.com/apollographql/apollo-client-devtools/pull/131)
- Fix issue where "Run in GraphiQL" does not include fragments <br/>
  [@henryqdineen](https://github.com/henryqdineen) in [#133](https://github.com/apollographql/apollo-client-devtools/pull/133)

## 2.1.3

- fixed styling of mutation list
- Allow to use `query.metadata.component.displayName` ([#126](https://github.com/apollographql/apollo-client-devtools/pull/126))
- Fixed mutation run in GraphiQL button ([#127](https://github.com/apollographql/apollo-client-devtools/pull/127))
- Fixed bug where query.queryString did not exist ([#125](https://github.com/apollographql/apollo-client-devtools/pull/125))
- Update vendor GraphiQL styles & fix autocomplete styling ([#123](https://github.com/apollographql/apollo-client-devtools/pull/123))

## 2.1.0

- rebuilt with new architecture
- initial local schema support (when using cache)
- initial subscription support
- improved dark theme

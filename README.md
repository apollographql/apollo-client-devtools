# Apollo Client Devtools

[Download for Chrome](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm) | (Download for Firefox temporarily disabled, it was removed from the Firefox store until the usage of `eval` is removed)

This repository contains the Apollo DevTools extension for Chrome & Firefox.

If you are running Apollo Client 2.0, the dev tools require at least `apollo-client@2.0.0-rc.2` and `react-apollo@2.0.0-beta.0`, and you must be running at least version 2.0.5 of the dev tools themselves.

The devtools no longer work with Apollo Client 1.0, but upgrading should be relatively easy! If it isn't, please reach out on the [Apollo Slack](https://www.apollographql.com/#slack)

### Code of Conduct

This project is governed by the [Apollo Code of Conduct](https://github.com/apollographql/apollo/blob/master/CODE-OF-CONDUCT.md)

# Features

The devtools appear as an "Apollo" tab in your Chrome inspector, along side the "Elements" and "Console" tabs. There are currently 3 main features of the devtools:

- GraphiQL: Send queries to your server through the Apollo network interface, or query the Apollo cache to see what data is loaded.
- Normalized store inspector: Visualize your GraphQL store the way Apollo Client sees it, and search by field names or values.
- Watched query inspector: View active queries and variables, and locate the associated UI components.

![GraphiQL Console](/assets/apollo-devtools-graphiql.png)

Make requests against either your app’s GraphQL server or the Apollo Client cache through the Chrome developer console. This version of GraphiQL leverages your app’s network interface, so there’s no configuration necessary — it automatically passes along the proper HTTP headers, etc. the same way your Apollo Client app does.

![Store Inspector](/assets/apollo-devtools-store.png)

View the state of your client-side cache as a tree and inspect every object inside. Visualize the [mental model](https://dev-blog.apollodata.com/the-concepts-of-graphql-bc68bd819be3) of the Apollo cache. Search for specific keys and values in the store and see the path to those keys highlighted.

![Watched Query Inspector](/assets/apollo-devtools-queries.png)

View the queries being actively watched on any given page. See when they're loading, what variables they're using, and, if you’re using React, which React component they’re attached to. Angular support coming soon.

# Installation

You can install the extension via the [Chrome Webstore](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm).
If you want to install a local version of the extension instead, skip ahead to the **Developing** section.

### Configuration

While your app is in dev mode, the devtools will appear as an "Apollo" tab in your chrome inspector. To enable the devtools in your app even in production, pass `connectToDevTools: true` to the ApolloClient constructor in your app. Pass `connectToDevTools: false` if want to manually disable this functionality.

The "Apollo" tab will appear in the Chrome console if there exists a global `window.__APOLLO_CLIENT__` object in your app. Apollo Client adds this hook to the window automatically unless `process.env.NODE_ENV === 'production'`. If you would like to use the devtools in production, just manually attach your Apollo Client instance to `window.__APOLLO_CLIENT__` or pass `connectToDevTools: true` to the constructor.

If you're seeing the "Apollo" tab but still having issues, skip ahead to the **Developing: Debugging** section.

# Developing

### Installation

After cloning this repo, compile the extension bundle:

```bash
cd apollo-client-devtools
npm install
npm run build
```

Install the extension in Chrome:

- Open [chrome://extensions](chrome://extensions)
- Enable the 'Developer Mode' checkbox
- Click 'Load unpacked extensions...'
- Select the `apollo-client-devtools/shells/webextension` folder

Now, while on any page, open the chrome inspector. If you're inspecting a page that is using Apollo Client, there will be a global `window.__APOLLO_CLIENT__` object on that page. If that object exists, you will see an "Apollo" tab in the inspector menu. This tab will contain the Apollo Client devtools.

### Folder structure

The extension is built using React and ES6. All the main source code for the devtools exists in the `/src`
folder, with `devtools/components/Panel.js` being the container component, and `index.js` attatching the
`Panel` to the document itself. If you're interested in editing the current code or adding a new feature,
you would do so here.

Since the devtools are designed to work in multiple environments, the `/shells` folder is where each environment is setup. The one for chrome and firefox live under `webextension`. Wepback bundles the code from the `/src` into `/shells/webextension/dist` when building for chrome for example. To load the
extension locally, you would load from this folder. Likewise, to upload the extension to the Chrome Webstore,
you would upload a zip of this folder.

The root of the repo contains the .bablerc file, webpack config file, and necessary package.json.

### Reloading the Chrome extension

Unfortunately, there is no way to hot-reload a Chrome extension in the inspector while developing it.

While actively working on the devtools, you should run `npm run chrome` in the devtools repo. This will have webpack watch your files, and rebundle them automatically whenever you make a change. With `webpack -w` running, you'll simply have to close the chrome inspector and open it again to see your changes in effect (no need to hit reload on the [chrome://extensions](chrome://extensions) page unless you make a change to the extension manifest).

### Developing with hot reload in an app

Working within a specific browser's extension environment can be a less than ideal development experience. To make this better, we have created a local shell with hot reloading to try out features. To run this, run `npm run dev` and go to [the local app](https://localhost:8080).

_Note: While great for expedited development of layout and CSS, this method doesn't allow you to simulate the environment of a chrome extension perfectly. Thus, we recommend you use a combination of both this process and the one described in the previous section while working on the extension. Make sure to test any major changes in the final environment._

### Debugging

If there is an error in the devtools panel, you can inspect it just like you would inspect a normal webpage. Detach the inspector console from the window (if it's not already detached) by clicking the button with three vertical dots in the upper right corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect elements in the first inspector, including the Apollo dev tools panel.

If you are using Apollo Client 2.0, make sure you are using at least version 2.0.5 of the devtools.

If you're seeing an error that's being caused by the devtools, please open an Issue on this repository with a detailed explanation of the problem and steps that we can take to replicate the error.

### Releasing new Versions

We will release new versions of the devtools to the Chrome Webstore as we merge PRs or add new features.

Release process, for those with permission:

- Commit changes, update the `manifest.json` version number where needed, and tag your version release.
- Verify that your changes work as expected by loading the extension as an "unpacked extension" locally for each browser.
- Merge changes and version tag to `master`.
- Run `npm run zip` to pack all of the builds for submission.
- Create a new release on the webstores of each extension (and eventually cut a new electron release), uploading the new zip folder.
- Make sure the version used in `manifest.json` is also used in `package.json`, and publish a new version to npm using `npm publish` in the root of the project.

### Prior Art

Special thanks goes out to the [Vue devtools](https://github.com/vuejs/vue-devtools) and in particular the help of [Guillaume Chau (@Akryum)](https://github.com/Akryum) who has been an incredible part of the Apollo community. The continued progress of this tool wouldn't be possible without his guidance and help.

## Maintainers

- [@justinanastos](https://github.com/justinanastos) (Apollo)
- [@cheapsteak](https://github.com/cheapsteak) (Apollo)

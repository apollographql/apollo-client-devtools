Apollo Client Devtools
===

This repository contains the [Apollo Client Devtools](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm) Chrome extension and React component.

The dev tools require at least `apollo-client@0.5.18`. To see component names in the query inspector, you need at least `react-apollo@0.7.1`.

Features
===

The devtools appear as an "Apollo" tab in your Chrome inspector, along side the "Elements" and "Console" tabs. There are currently 3 main features of the devtools:

 * GraphiQL: Send queries to your server through the Apollo network interface, or query the Apollo cache to see what data is loaded.
 * Normalized store inspector: Visualize your GraphQL store the way Apollo Client sees it, and search by field names or values.
 * Watched query inspector: View active queries and variables, and locate the associated UI components.

![GraphiQL Console](/imgs/apollo-devtools-graphiql.png)

Make requests against either your app’s GraphQL server or the Apollo Client cache through the Chrome developer console. This version of GraphiQL leverages your app’s network interface, so there’s no configuration necessary — it automatically passes along the proper HTTP headers, etc. the same way your Apollo Client app does.

![Store Inspector](/imgs/apollo-devtools-store.png)

View the state of your client-side cache as a tree and inspect every object inside. Visualize the [mental model](https://dev-blog.apollodata.com/the-concepts-of-graphql-bc68bd819be3) of the Apollo cache. Search for specific keys and values in the store and see the path to those keys highlighted.

![Watched Query Inspector](/imgs/apollo-devtools-queries.png)

View the queries being actively watched on any given page. See when they're loading, what variables they're using, and, if you’re using React, which React component they’re attached to. Angular support coming soon.

Installation
===

You can install the extension via the [Chrome Webstore](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm).
If you want to install a local version of the extension instead, skip ahead to the __Developing__ section.

### Configuration

While your app is in dev mode, the devtools will appear as an "Apollo" tab in your chrome inspector. To enable the devtools in your app even in production, pass `connectToDevTools: true` to the ApolloClient constructor in your app.  Pass `connectToDevTools: false` if want to manually disable this functionality.

The "Apollo" tab will appear in the Chrome console iff there exists a global `window.__APOLLO_CLIENT__` object in your app. Apollo Client adds this hook to the window automatically unless `process.env.NODE_ENV === 'production'`. If you would like to use the devtools in production, just manually attach your Apollo Client instance to `window.__APOLLO_CLIENT__` or pass `connectToDevTools: true` to the constructor.

If you're seeing the "Apollo" tab but still having issues, skip ahead to the __Developing: Debugging__ section.

Developing
===

### Installation

After cloning this repo, compile the extension bundle:

```bash
cd apollo-client-devtools
npm install
npm run build
```

Install the extension in Chrome:

 * Open [chrome://extensions](chrome://extensions)
 * Enable the 'Developer Mode' checkbox
 * Click 'Load unpacked extensions...'
 * Select the `apollo-client-devtools/extension` folder

Now, while on any page, open the chrome inspector. If you're inspecting a page that is using Apollo Client, there will be a global `window.__APOLLO_CLIENT__` object on that page. If that object exists, you will see an "Apollo" tab in the inspector menu. This tab will contain the Apollo Client devtools.

### Folder structure

The extension is built using React and ES6. All the main source code for the devtools exists in the `/app`
folder, with `components/Panel.js` being the container component, and `index.js` attatching the
`Panel` to the document itself. If you're interested in editing the current code or adding a new feature,
you would do so here.

Wepback bundles the code from `/app` into `/extension/dist`. Thus the `/extension` folder contains
the chrome extension itself, and has the necessary manifest.json file and image resources. To load the
extension locally, you would load from this folder. Likewise, to upload the extension to the Chrome Webstore,
you would upload a zip of this folder.

The root of the repo contains the .bablerc file, webpack config file, and necessary package.json and
index.js files to make the repo bundle correctly and export as a node module (see the next section).

### Reloading the Chrome extension

Unfortunately, there is no way to hot-reload a Chrome extension in the inspector while developing it.

While actively working on the devtools, you should run `npm start` in the devtools repo. This will have webpack watch your files, and rebundle them automatically whenever you make a change. With `webpack -w` running, you'll simply have to close the chrome inspector and open it again to see your changes in effect (no need to hit reload on the [chrome://extensions](chrome://extensions) page unless you make a change to the extension manifest).

### Developing with hot reload in an app

For faster development with hot reloading, we have also created a way for you to insert the devtools panel into an apollo client app as a React component, and thus have it hot reload using your app's own reloading configuration.

To do this, first link the apollo-client-devtools to your app's node modules.

```bash
cd /path/to/your/apollo-client/app
npm link /path/to/apollo-client-devtools
```

Then in your app, import the apollo-client-devtools `Panel` component:

```js
const Panel = require('apollo-client-devtools').Panel;
```

Now you can insert the `<Panel />` component into your app. This will overlay the contents of the Apollo dev tools tab onto your app, allowing you to work on code in the extension at the same speed with which you'd work on code for your app.

We've been developing internally against [Githunt-React](https://github.com/apollostack/GitHunt-React). If you checkout and run the `devtools` branch on Githunt-React, you can develop against the same configuration we've been using.

*Note: While great for expedited development of layout and CSS, this method doesn't allow you to simulate the environment of a chrome extension perfectly. Thus, we recommend you use a combination of both this process and the one described in the previous section while working on the extension. Make sure to test any major changes in the final environment.*

### Debugging

If the devtools panel is blank, it may be because you have third party cookies disabled. See [this stackoverflow](https://stackoverflow.com/questions/30481516/iframe-in-chrome-error-failted-to-read-localstorage-from-window-access-den) issue on how to enable them. This affects the devtools because they access `localStorage`, and that settings makes them throw an error when rendering.

If there is an error in the devtools panel, you can inspect it just like you would inspect a normal webpage. Detach the inspector console from the window (if it's not already detached) by clicking the button with three vertical dots in the upper right corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect elements in the first inspector, including the Apollo dev tools panel.

If you're seeing an error that's being caused by the devtools, please open an Issue on this repository with a detailed explanation of the problem and steps that we can take to replicate the error.

### Releasing new Versions

We will release new versions of the devtools to the Chrome Webstore as we merge PRs or add new features.

Release process, for those with permission:

 * Commit changes, update the `manifest.json` version number, and tag your version release.
 * Verify that your changes work as expected by loading the `/extension` folder as an "unpacked extension" locally.
 * Merge changes and version tag to `master`.
 * Zip the `/extension` folder and name it `extension-[v.X.X.X].zip`.
 * Create a new release on the Chrome Webstore, uploading the new zip folder.

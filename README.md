Apollo Client Devtools
===
This project contains the [Apollo Client Devtools](...) Chrome extension.

Use of the devtools requires at least `apollo-client@0.5.18`. React integration (showing component names in the queries tab) requires `react-apollo@0.7.1`, and Angular integration is coming soon.

Features
===

The devtools appear as an "Apollo" tab in your Chrome inspector, along side the "Elements" and "Console" tabs. There are currently 3 main features of the devtools:

 * GraphiQL integration in the Chrome devtools: query to your Server or Cache directly
 * Redux store visualization in an Apollo-Client-friendly way, with key/value searching
 * Watched query inspection: view active queries with their variables and associated components

![GraphiQL Console](/imgs/apollo-devtools-graphiql.png)

Make requests against either your app’s GraphQL server or the Apollo Client cache through the Chrome developer console. This version of GraphiQL leverages your app’s network interface, so there’s no configuration necessary — it automatically passes along the proper HTTP headers, etc. pulled directly from your Apollo Client app.

![Store Inspector](/imgs/apollo-devtools-store.png)

View the state of your client-side cache as a traversable tree and inspect every object inside.
Search for specific keys and values in the store and see the path to those keys highlighted.

![Watched Query Inspector](/imgs/apollo-devtools-queries.png)

View the queries being actively watched on any given page. See when they're loading, what variables
they're using, and if you’re using React, which React component they’re attached to (Angular support coming soon).

Installation
===
You can install the extension via the [Chrome Webstore](...). If you want to install a local version of the extension instead, skip ahead to the __Developing__ section.

### Configuration
While your app is in dev mode, the devtools will appear as an "Apollo" tab in your chrome inspector. To enable the devtools in your app even in production, pass `connectToDevTools: true` to the ApolloClient constructor in your app.  Pass `connectToDevTools: false` if you never want to enable the devtools.

### Enabling devtools in production
The "Apollo" tab will appear in the Chrome console iff there exists a global `window.__APOLLO_CLIENT__` object in your app. Apollo Client adds this hook to the window automatically as of version 0.5.18, unless `process.env.NODE_ENV === 'production'`. If you would like to use the devtools in production, just manually attach your Apollo Client instance to `window.__APOLLO_CLIENT__`.

If you're seeing the "Apollo" tab but still having issues, skip ahead to the __Developing: Debugging__ section.

Developing
===

### Installation


After cloning this repo, compile the extension bundle:

 * `cd apollo-client-devtools`
 * `npm install && webpack`

Install the extension in Chrome:

 * Open [chrome://extensions](chrome://extensions)
 * Enable the 'Developer Mode' checkbox
 * Click 'Load unpacked extensions...'
 * Select the `apollo-client-devtools` folder


Now while on any page, open the chrome inspector. If you're inspecting a page that is using Apollo Client, there will be a global `window.__APOLLO_CLIENT__` object on that page. If that object exists, you will see an "Apollo" tab in the inspector menu. This tab will contain the Apollo Client devtools.

### Hot Reloading
Unfortunately, there is no way to hot-reload a Chrome extension in the inspector while developing it.

While actively working on the devtools, you should run `webpack -w` in the devtools repo. This will have webpack watch your files, and rebundle them automatically whenever you make a change (necessary because we're using React + ES2015). With `webpack -w` running, you'll simply have to close the chrome inspector and open it again to see your changes in effect (no need to hit reload on the [chrome://extensions](chrome://extensions) page).

...

For faster development with hot reloading, we have also created a way for you to insert the devtools Panel into an apollo client app, and thus have it hot reload using your app's own reloading configuration.

To do this, first link the apollo-client-devtools to your app's node modules.

 * `cd /path/to/your/apollo-client/app`
 * `npm link /path/to/apollo-client-devtools`

Then in your app, import the apollo-client-devtools Panel:

`const Panel = require('apollo-client-devtools').Panel;`

Now you can insert the `<Panel />` component into your app. This will overlay the contents of the Apollo dev tools tab onto your app, allowing you to work on code in the extension at the same speed with which you'd work on code for your app.

We've been developing internally against [Githunt-React](https://github.com/apollostack/GitHunt-React). If you run the `devtools` branch on Githunt-React, you can develop against the same configuration we've been using.

*Note: While great for expedited development of layout and CSS, this method doesn't allow you to simulate the environment of a chrome extension perfectly. Thus, we recommend you use a combination of both these processes while working on the extension.*

### Debugging
If the devtools error, you can inspect them just like you would inspect a normal webpage. Detach the inspector console from the window (if it's not already detached) by clicking the button with three vertical dots in the upper right corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect elements in the first inspector, including the Apollo dev tools panel.

If you're seeing an error that's being caused by the devtools, please open an Issue on this repo with a detailed explanation of the problem and steps we can take to replicate the error.

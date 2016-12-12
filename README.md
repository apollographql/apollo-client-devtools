Apollo Client Devtools
===
This project contains the Apollo Client Devtools chrome extension.

Use of the devtools requires at least `apollo-client@0.5.18`, and if you're using React, it's best with `react-apollo@0.7.1`.

You can install the extension via the Chrome Webstore. While your app is in dev mode, the devtools will appear as an "Apollo" tab in your chrome inspector. The tools will not appear in production unless you specify this flag in apollo-client... [glasser]?


Installation
===
If you're looking to use the devtools, you can install the extension via the Chrome Webstore. Else, the rest of this README will describe how to install and run the extension locally for development purposes.


After cloning this repo, compile the extension bundle:

 * `cd apollo-chrome-devtools`
 * `npm install && webpack`

Install the extension in Chrome:

 * Open [chrome://extensions](chrome://extensions)
 * Enable the 'Developer Mode' checkbox
 * Click 'Load unpacked extensions...'
 * Select the `apollo-chrome-devtools` folder


Now while on any page, open the chrome inspector. If you're inspecting a page that is using Apollo Client, there will be a global `window.__APOLLO_CLIENT__` object on that page. If that object exists, you will see an "Apollo" tab in the inspector menu. This tab will contain the Apollo Client devtools.


Developing
===
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

We've been developing internally against [Githunt-React](https://github.com/apollostack/GitHunt-React). If you run the `devtools` branch on Githunt-React, you can develop agains the same configuration we've been using.

*Note: While great for expedited development of layout and CSS, this method doesn't allow you to simulate the environment of a chrome extension perfectly. Thus, we recommend you use a combination of both these processes while working on the extension.*


Debugging
===
If the devtools error, you can inspect them just like you would inspect a normal webpage. Detach the inspector console from the window (if it's not already detached) by clicking the button with three vertical dots in the upper right corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect elements in the first inspector, including the Apollo dev tools panel.

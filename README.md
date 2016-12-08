Apollo Client Devtools
===
This project contains the Apollo Client Devtools Chrome extension.


Installation
===
Compile the extension bundle:

 * `cd apollo-client-devtools`
 * `npm install && webpack`

Install the extension:

 * Open [chrome://extensions](chrome://extensions)
 * Enable 'Developer Mode' checkbox
 * Click 'Load unpacked extensions...'
 * Select the `apollo-client-devtools` folder


Usage
===
While on any page, open the chrome inspector (`opt-cmd-I`). If the page you're inspecting has
a `window.__APOLLO_CLIENT__` object, you should see an "Apollo" console tab. This tab will contain
the Apollo Client Devtools.


Developing the extension
===
Unfortunately, there is no way to hot-reload a Chrome extension in the Chrome inspector while developing it.

While actively working on the devtools, it can be helpful to run `webpack -w` in the devtools repo,
to have webpack rebundle your files automatically whenever you make a change. To see your changes though,
you will still have to go back to the [chrome://extensions](chrome://extensions) page and reload the extension.

...

For expedited development, you can insert the devtools Panel into an apollo client app, and have
it hot-reload using your app's own reloading configuration.

To do this, first link the apollo-client-devtools to your app's node_modules folder.

`cd /path/to/your/apollo-client/app`
`npm link /path/to/apollo-client-devtools`

Then in your app, import the apollo-client-devtools Panel:

`const Panel = require('apollo-client-devtools').Panel;`

Now you can insert the `<Panel />` component into your app. This will overlay the contents of the Apollo dev tools tab onto your app, allowing you to work on code in the extension at the same speed with which you'd work on code for your app. We've been developing internally against [Githunt](https://github.com/apollostack/GitHunt-React).


Debugging
===
If the devtools do not appear (or error) you can inspect them. Detach the console from the window
(if it's not already detached) by clicking the button with three vertical dots in the upper right
corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect elements in the first inspector, including the Apollo dev tools panel.

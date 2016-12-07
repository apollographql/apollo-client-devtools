Apollo Client Devtools
===
This project contains the Apollo Client Devtools Chrome extension.

 * GraphiQL interface
 * Cache inspector
 * Query watcher



Installation
===
Compile the extension bundle:

 * `cd apollo-client-devtools`
 * `npm install && npm run build`

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


Debugging
===
If the devtools do not appear, or error, you can inspect them. Detach the console from the window
(if it's not already detached) by clicking the button with three vertical dots in the upper right
corner of the console. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect the elements
of the extension that live in the first inspector.

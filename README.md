# Apollo Client Devtools

[Download for Firefox](https://addons.mozilla.org/firefox/addon/apollo-developer-tools/) | [Download for Chrome](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm)

This repository contains the Apollo DevTools extension for Chrome & Firefox.

If you are running Apollo Client 2.0, the dev tools require at least `apollo-client@2.0.0-rc.2` and `react-apollo@2.0.0-beta.0`, and you must be running at least version 2.0.5 of the dev tools themselves.

If you are running Apollo Client 3.0, you must be running at least version 2.3.5 of the dev tools.

The devtools no longer work with Apollo Client 1.0, but upgrading should be relatively easy! If it isn't, please reach out on the [Apollo Spectrum](https://spectrum.chat/apollo)

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

You can install the extension via [Firefox Browser Add-ons](https://addons.mozilla.org/firefox/addon/apollo-developer-tools/) or the [Chrome Webstore](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm).
If you want to install a local version of the extension instead, skip ahead to the **Developing** section.

### Configuration

While your app is in dev mode, the devtools will appear as an "Apollo" tab in your chrome inspector. To enable the devtools in your app even in production, pass `connectToDevTools: true` to the ApolloClient constructor in your app. Pass `connectToDevTools: false` if want to manually disable this functionality.

The "Apollo" tab will appear in the Chrome console if there exists a global `window.__APOLLO_CLIENT__` object in your app. Apollo Client adds this hook to the window automatically unless `process.env.NODE_ENV === 'production'`. If you would like to use the devtools in production, just manually attach your Apollo Client instance to `window.__APOLLO_CLIENT__` or pass `connectToDevTools: true` to the constructor.

If you're seeing the "Apollo" tab but still having issues, skip ahead to the **Developing: Debugging** section.

# Developing

### Installation

After cloning this repo, install the required packages:

```bash
cd apollo-client-devtools
npm install
```

### Running the sample application

We provide a sample application to run when developing and testing the extension. To run it, install the required dependencies for both the client and server:

```bash
npm run install:dev
```

Then start the application:

```bash
npm run start:dev
```

Navigate to `localhost:3000` to view the application. To view the API schema, navigate to `localhost:4000`.


### Development with web-ext & WebExtWebpackPlugin

For cross-browser development, we rely on the [web-ext](https://github.com/mozilla/web-ext) command line tool and a modified version of the [WebExtWebpackPlugin](https://github.com/hiikezoe/web-ext-webpack-plugin) that hooks into the build process. 

To develop with Firefox, run the following command:

```bash
npm run firefox
```

For Chrome, run the following command:

```bash
npm run chrome
```

Running either of these commands will:

- Build and bundle the extension and application
- Use `webpack --watch` to watch source files for changes
- Install the extension in the browser
- Open the targeted browser window to `localhost:3000` (the sample application)
- Rebuild and reload the extension when the source files are changed

Note that even though the extension is rebuilt and reloaded, a hard refresh is still required. Hot reloading is not an option for web extensions.

#### Development defaults

Defaults can be found and modified in the WebExtPlugin. You might want to do so if you'd like the targeted browser to open to a different address or to turn on `lintOnBuild`.

### Folder structure

There are two main pieces of the Apollo Devtools: the extension itself and a React application. The extension is the code that communicates with the browser. It's what allows us to search an inspected window for an instance of Apollo Client and to create the Apollo tab in the browser's devtools panel. The React application is what powers the experience in the Apollo Devtools panel.

The Apollo Devtools folder structure mirrors this architecture. The source code for extension can be found at `src/extension`. The React application code can be found at `src/application`.

At the root of the project, there is a .babelrc file, webpack.config.js, and package.json.

For builds, we utilize the `build` folder. After a build, all the files needed to run the Apollo Devtools can be found here. If these files are bundled for development, sourcemaps are provided. When the files are bundled for production, source maps are not provided and the code is minified. We utilize the `dist` folder for distributable zip files.

### Debugging

If there is an error in the devtools panel, you can inspect it just like you would inspect a normal webpage. Detach the inspector console from the window (if it's not already detached) by clicking the button with three vertical dots in the upper right corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect elements in the first inspector, including the Apollo dev tools panel.

If you are using Apollo Client 2.0, make sure you are using at least version 2.0.5 of the devtools.

If you are using Apollo Client 3.0, make sure you are using at least version 2.3.5 of the devtools.

If you're seeing an error that's being caused by the devtools, please open an Issue on this repository with a detailed explanation of the problem and steps that we can take to replicate the error.

### Prior Art

Special thanks goes out to the [Vue devtools](https://github.com/vuejs/vue-devtools) and in particular the help of [Guillaume Chau (@Akryum)](https://github.com/Akryum) who has been an incredible part of the Apollo community. The continued progress of this tool wouldn't be possible without his guidance and help.

## Publishing

Release process, for those with permission:

1. Commit changes, update the `manifest.json` version number where needed, and tag your version release.
2. Verify that your changes work as expected by loading the extension as an "unpacked extension" locally for each browser.
3. Merge changes and version tag to `master`.
4. Run `npm run zip` to pack all of the builds for submission.
5. Make sure the version used in `manifest.json` is also used in `package.json`, and publish a new version to npm using `npm publish` in the root of the project. We're publishing to npm to allow other projects to have a dependency on devtools.
6. Create a new release in the Chrome/Firefox web stores (following the instructions for each browser in the sections below), uploading the new zip folder.

### Chrome

TODO

### Firefox

1. Login to the [Firefox developer hub](https://addons.mozilla.org/developers) (user/pass is in our shared password system as "Firefox Developer Account").
2. Once logged in, click on the Apollo Client Developer Tools "Edit Product Page" link.
3. Click on the "Upload New Version" link in the top left side menu.
4. Agree to any new Firefox distribution agreements or policies that might show up.
5. When the "Submit a New Version" page shows, click on the file upload button in the "Upload Version" section (keeping "Firefox" as the only option checked in the compatible application section).
6. Choose the `apollo-client-devtools/dist/apollo_client_developer_tools-X.X.X.zip` for upload and submit.
7. After the file has been validated, continue with the submission.

## Maintainers

- [@jcreighton](https://github.com/jcreighton) (Apollo)
- [@benjamn](https://github.com/benjamn) (Apollo)
- [@hwillson](https://github.com/hwillson) (Apollo)

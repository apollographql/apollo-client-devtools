<a href="https://www.apollographql.com/"><img src="https://user-images.githubusercontent.com/841294/53402609-b97a2180-39ba-11e9-8100-812bab86357c.png" height="100" alt="Apollo Client"></a>

# Apollo Client Browser Devtools

[![Build Status](https://circleci.com/gh/apollographql/apollo-client-devtools.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-client-devtools)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/apollo)

[Download for Firefox](https://addons.mozilla.org/firefox/addon/apollo-developer-tools/) | [Download for Chrome](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm)

This repository contains the Apollo Client Browser Devtools extension for Chrome & Firefox.

## Features

The Apollo Client Browser Devtools appear as an "Apollo" tab in your web browser inspector, alongside other tabs like "Elements" and "Console". The devtools currently have four main features:

- **GraphiQL:** Send queries to your server through your web applications configured Apollo Client instance, or query the Apollo Client cache to see what data is loaded.
- **Watched query inspector:** View active queries, variables, cached results, and re-run individual queries.
- **Mutation inspector:** View fired mutations, variables, and re-run individual mutations.
- **Cache inspector:** Visualize the Apollo Client cache and search through it by field names and/or values.

![Apollo Client Browser Devtools](./assets/ac-browser-devtools-3.png)

## Installation

You can install the extension via [Firefox Browser Add-ons](https://addons.mozilla.org/firefox/addon/apollo-developer-tools/) or the [Chrome Webstore](https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm). If you want to install a local version of the extension instead, skip ahead to the [Developing](#Developing) section.

### Configuration

While your application is in dev mode, the devtools will appear as an "Apollo" tab in your web browser inspector. To enable the devtools for your application in production, pass `connectToDevTools: true` to the ApolloClient constructor in your application. Pass `connectToDevTools: false` if want to manually disable this functionality.

The "Apollo" tab will appear in your web browser inspector if a global `window.__APOLLO_CLIENT__` object exists in your application. Apollo Client adds this hook to the window automatically unless `process.env.NODE_ENV === 'production'`. If you would like to use the devtools in production, manually attach your Apollo Client instance to `window.__APOLLO_CLIENT__` or pass `connectToDevTools: true` to the constructor.

If you are seeing the "Apollo" tab but are still having issues, skip ahead to the [Debugging](#Debugging) section.

#### Custom headers

For custom headers you set in the 'Headers' tab in the Explorer to be passed through correctly, the Apollo Links that you have set up in your app must forward through the previous headers. [See the documentation on how to do this for for information.](https://www.apollographql.com/docs/react/api/link/introduction/#composing-a-link-chain)

## Developing

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

### Tests

We use [Jest](https://jestjs.io/) and the [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) to write and run our tests.

To run tests for both `src` and `development`, run the following command:

```bash
npm run test
```

You can also run with `--watch` to watch and re-run tests automatically:

```bash
npm run test:watch
```

### Folder structure

There are two main pieces of the Apollo Client Browser Devtools: the extension itself and a React application. The extension is the code that communicates with the browser. It allows us to search an inspected window for an instance of Apollo Client and to create the Apollo tab in the browser's devtools panel. The React application powers the experience in the devtools panel.

The devtools folder structure mirrors this architecture. The source code for the extension can be found in `src/extension`. The React application code can be found in `src/application`.

For builds, we use the `build` folder. After a build, all of the files needed to run the devtools can be found here. If these files are bundled for development, source maps are provided. When these files are bundled for production, source maps are not provided and the code is minified. We use the `dist` folder for distributable zip files.

### Debugging

If there is an error in the devtools panel, you can inspect it just like you would inspect a normal webpage. Detach the inspector console from the window (if it's not already detached) by clicking the button with three vertical dots in the upper right corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector for the detached console (inspector inception). In this new inspector you will be able to inspect elements in the first inspector, including the devtools panel.

If you are using Apollo Client 2.0, make sure you are using at least version 2.0.5 of the devtools.

If you are using Apollo Client 3.0, make sure you are using at least version 2.3.5 of the devtools.

If you're seeing an error that's being caused by the devtools, please open an issue on this repository with a detailed explanation of the problem and steps that we can take to replicate the error.

## Publishing

Release process, for those with permission:

1. Verify that your changes work as expected by loading the extension as an "unpacked extension" locally for each browser.
2. Update the `./package.json` and `./src/extension/manifest.json` version numbers.
3. Commit changes and tag your version as a github release.
4. Run `npm run zip` to pack all of the builds for submission.
5. Publish a new version to npm using `npm publish` in the root of the project. We're publishing to npm to allow other projects to have a dependency on devtools.
6. Create a new release in the Chrome/Firefox web stores (following the instructions for each browser in the sections below), uploading the zip bundle.

### Chrome

#### Testing locally

1. In your Chrome URL bar, go to: `chrome://extensions/`
2. Click on `Load unpacked`.
3. Add the `apollo-client-devtools/build` directory.
4. The add-on should now be installed.

#### Submit for review

1. Login to the [Chrome webstore](https://chrome.google.com/webstore/user/purchases?authuser=1) and access the Developer Dashboard.
2. Select the `Apollo Client Devtools` extension to update.
3. Click on `Package` then `Upload new package`.
4. Select the `./dist/chrome.zip` file for upload.
5. Click on "Submit for review".

### Firefox

#### Testing locally

1. In your Firefox URL bar, go to: `about:debugging#/runtime/this-firefox`
2. Click on `Load Temporary Add-on`.
3. Add the `apollo-client-devtools/dist/apollo_client_developer_tools-X.X.X.zip` file.
4. The add-on should now be installed.

#### Submit for review

1. Login to the [Firefox developer hub](https://addons.mozilla.org/developers) (user/pass is in our shared password system as "Firefox Developer Account").
2. Once logged in, click on the Apollo Client Developer Tools "Edit Product Page" link.
3. Click on the "Upload New Version" link in the top left side menu.
4. Agree to any new Firefox distribution agreements or policies that might show up.
5. When the "Submit a New Version" page shows, click on the file upload button in the "Upload Version" section (keeping "Firefox" as the only option checked in the compatible application section).
6. Choose the `apollo-client-devtools/dist/apollo_client_developer_tools-X.X.X.zip` for upload and submit.
7. After the file has been validated, continue with the submission.

## Code of Conduct

This project is governed by the [Apollo Code of Conduct](https://www.apollographql.com/docs/community/code-of-conduct/).

## Maintainers

- [@jcreighton](https://github.com/jcreighton) (Apollo)
- [@benjamn](https://github.com/benjamn) (Apollo)
- [@hwillson](https://github.com/hwillson) (Apollo)

## Who is Apollo?

[Apollo](https://apollographql.com/) builds open-source software and a graph platform to unify GraphQL across your apps and services. We help you ship faster with:

* [Apollo Studio](https://www.apollographql.com/studio/develop/) – A free, end-to-end platform for managing your GraphQL lifecycle. Track your GraphQL schemas in a hosted registry to create a source of truth for everything in your graph. Studio provides an IDE (Apollo Explorer) so you can explore data, collaborate on queries, observe usage, and safely make schema changes.
* [Apollo Federation](https://www.apollographql.com/apollo-federation) – The industry-standard open architecture for building a distributed graph. Use Apollo’s open-source gateway to compose a unified graph from multiple subgraphs, determine a query plan, and route requests across your services.
* [Apollo Client](https://www.apollographql.com/apollo-client/) – The most popular GraphQL client for the web. Apollo also builds and maintains [Apollo iOS](https://github.com/apollographql/apollo-ios) and [Apollo Android](https://github.com/apollographql/apollo-android).
* [Apollo Server](https://www.apollographql.com/docs/apollo-server/) – A production-ready JavaScript GraphQL server that connects to any microservice, API, or database. Compatible with all popular JavaScript frameworks and deployable in serverless environments.

## Learn how to build with Apollo

Check out the [Odyssey](https://odyssey.apollographql.com/) learning platform, the perfect place to start your GraphQL journey with videos and interactive code challenges. Join the [Apollo Community](https://community.apollographql.com/) to interact with and get technical help from the GraphQL community.

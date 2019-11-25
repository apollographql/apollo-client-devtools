# Apollo Client Devtools

[Download for Chrome](TODO)

This repository contains the Apollo DevTools extension for Chrome.

The devtools no longer work with Apollo Client 1.0 or Apollo Client 2.0 but upgrading should be relatively easy! If it isn't, please reach out on the [Apollo Slack](https://www.apollographql.com/#slack)

### Code of Conduct

This project is governed by the [Apollo Code of Conduct](https://github.com/apollographql/apollo/blob/master/CODE-OF-CONDUCT.md)

# Features

The devtools appear as an "Apollo" tab in your Chrome inspector, along side the "Elements" and "Console" tabs.

[//]: # TODO

# Installation

You can install the extension via the [Chrome Webstore](TODO).
If you want to install a local version of the extension instead, skip ahead to the **Developing** section.

### Configuration

[//]: # TODO

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
- Select the `apollo-client-devtools/dist` folder

Now, while on any page, open the chrome inspector. If you're inspecting a page that is using Apollo Client, there will be a global `window.__APOLLO_CLIENT__` object on that page. If that object exists, you will see an "Apollo" tab in the inspector menu. This tab will contain the Apollo Client devtools.

### Folder structure

[//]: # TODO

### Reloading the Chrome extension

[//]: # TODO

### Debugging

If there is an error in the devtools panel, you can inspect it just like you would inspect a normal webpage. Detach the inspector console from the window (if it's not already detached) by clicking the button with three vertical dots in the upper right corner of the console and selecting the detach option. With the detached console in focus, press `opt-cmd-I` again to open an inspector
for the detached console (inspector inception). In this new inspector, you will be able to inspect elements in the first inspector, including the Apollo dev tools panel.

If you're seeing an error that's being caused by the devtools, please open an Issue on this repository with a detailed explanation of the problem and steps that we can take to replicate the error.

### Releasing new Versions

We will release new versions of the devtools to the Chrome Webstore as we merge PRs or add new features.

Release process, for those with permission:

[//]: # TODO

## Maintainers

[//]: # TODO

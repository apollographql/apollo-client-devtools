// When publishing the devtools via Changesets, we read the new version number
// from package.json and update the version in src/extension/manifest.json
// before publishing the extension.
import fs from "fs";
import { version } from "./package.json";
import chromeManifest from "./src/extension/chrome/manifest.json";
import firefoxManifest from "./src/extension/firefox/manifest.json";

firefoxManifest.version = version;
chromeManifest.version = version;

const root = __dirname;

fs.writeFileSync(
  `${root}/src/extension/firefox/manifest.json`,
  JSON.stringify(firefoxManifest)
);

fs.writeFileSync(
  `${root}/src/extension/chrome/manifest.json`,
  JSON.stringify(chromeManifest)
);

// When publishing the devtools via Changesets, we read the new version number
// from package.json and update the version in src/extension/manifest.json
// before publishing the extension.
import fs from "fs";
import { version } from "./package.json";
import manifest from "./src/extension/manifest.json";

manifest.version = version;

const root = __dirname;

fs.writeFileSync(
  `${root}/src/extension/manifest.json`,
  JSON.stringify(manifest)
);

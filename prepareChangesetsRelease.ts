// When publishing the devtools via Changesets, we read the new version number
// from package.json and update the version in src/extension/manifest.json
// before publishing the extension.
import fs from "fs";
import { version } from "./package.json";
import manifestv2 from "./src/extension/manifest.json";
import manifestv3 from "./src/extension/manifestv3.json";

manifestv2.version = version;
manifestv3.version = version;

const root = __dirname;

fs.writeFileSync(
  `${root}/src/extension/manifest.json`,
  JSON.stringify(manifestv2)
);

fs.writeFileSync(
  `${root}/src/extension/manifestv3.json`,
  JSON.stringify(manifestv3)
);

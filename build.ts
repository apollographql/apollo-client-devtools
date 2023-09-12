import archiver from "archiver";
import fs from "fs";
import path from "path";

const releaseTarget = process.argv[process.argv.length - 1];
const extensionName = "apollo-client-devtools";

async function createSrcArchive() {
  console.log("Creating src archive");
  const curDir = path.resolve(path.dirname(""));
  const outputFile = `${curDir}/${extensionName}-src.zip`;

  const output = fs.createWriteStream(outputFile);

  const archive = archiver("zip", {
    zlib: {
      level: 5,
    },
  });

  archive.pipe(output);

  archive.directory("src", "src").glob("*", {
    ignore: [`${extensionName}-*.zip`, "*/"],
  });

  await archive.finalize();
  console.log("Created src archive");
}

export default async function createDistributable() {
  console.log(`Creating distributable for ${releaseTarget}`);

  const curDir = path.resolve(path.dirname(""));
  const outputFile = `${curDir}/${extensionName}-${releaseTarget}.zip`;
  const output = fs.createWriteStream(outputFile);

  const archive = archiver("zip", {
    zlib: {
      level: 5,
    },
  });

  archive.pipe(output);
  archive.directory(`build`, false);

  await archive.finalize();

  console.log(`Created distributable for ${releaseTarget}`);

  // Create a zipped copy of the source code for Firefox
  if (releaseTarget === "firefox") {
    await createSrcArchive();
  }
}

async function main() {
  await createDistributable();
}

main();

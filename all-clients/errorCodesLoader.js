import { registerHooks } from "node:module";
import * as semver from "semver";

registerHooks({
  resolve(specifier, context, nextResolve) {
    const regex = /^@apollo-client\/(.*?)\/invariantErrorCodes\.js$/;
    const match = regex.exec(specifier);
    const version = match?.[1];

    if (!version || !semver.satisfies(version, ">=4.0.0-alpha <=4.0.2")) {
      return nextResolve(specifier, context);
    }

    return nextResolve(
      `./node_modules/@apollo-client/${version}/invariantErrorCodes.js`,
      context
    );
  },
});

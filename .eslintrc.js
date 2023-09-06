module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "testing-library", "jest-dom", "@emotion"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:testing-library/react",
  ],
  env: {
    browser: true,
    node: true,
    webextensions: true,
  },
  rules: {
    "react/prop-types": 0,
    // https://emotion.sh/docs/eslint-plugin-react
    "react/no-unknown-property": ["error", { ignore: ["css"] }],
    "react/display-name": "off",
    "testing-library/no-node-access": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@emotion/pkg-renaming": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};

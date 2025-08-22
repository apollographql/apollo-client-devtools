import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import testingLibrary from "eslint-plugin-testing-library";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import hooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  jsxRuntime,
  {
    plugins: {
      "testing-library": testingLibrary,
    },
    rules: testingLibrary.configs.react.rules,
  },
  {
    plugins: {
      "react-hooks": hooksPlugin,
    },
    // @ts-expect-error waiting for https://github.com/facebook/react/issues/28313
    rules: hooksPlugin.configs.recommended.rules,
  },
  // original config contained a reference to jest-dom, but didn't configure any rules - skipping
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions,
      },
    },
    rules: {
      "react/prop-types": 0,
      "react/no-unknown-property": "error",
      "react/display-name": "off",
      "testing-library/no-node-access": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports",
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);

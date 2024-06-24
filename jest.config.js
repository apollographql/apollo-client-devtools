const esModules = ["lodash-es", "react-json-tree", "react-base16-styling"].join(
  "|"
);

export default {
  preset: "ts-jest/presets/js-with-babel",
  setupFilesAfterEnv: ["./test.setup.ts"],
  testEnvironment: "jsdom",
  globals: {
    VERSION: "0.0.0",
  },
  testPathIgnorePatterns: [
    "<rootDir>/build",
    "<rootDir>/dist",
    "/node_modules/",
    "/development/",
  ],
  transformIgnorePatterns: [`/node_modules/(?!(${esModules}))`],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
    "react-markdown": "<rootDir>/src/__mocks__/react-markdown.js",
    "rehype-raw": "<rootDir>/src/__mocks__/noop.js",
    "remark-gfm": "<rootDir>/src/__mocks__/noop.js",
    "remark-github": "<rootDir>/src/__mocks__/noop.js",
  },
};

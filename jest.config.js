export default {
  preset: "ts-jest",
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
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
};

import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/application/localSchema.graphql",
  documents: [
    "src/application/**/*.{ts,tsx}",
    "!src/application/**/*.test.{ts,tsx}",
  ],
  generates: {
    "src/application/types/gql.ts": {
      config: {
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
          defaultValue: false,
        },
        defaultScalarType: "unknown",
        nonOptionalTypename: true,
        omitOperationSuffix: true,
        scalars: {
          ID: "number",
          Cache: "./scalars#Cache",
          QueryData: "./scalars#QueryData",
          Variables: "./scalars#Variables",
        },
        skipTypeNameForRoot: true,
      },
      plugins: ["typescript", "typescript-operations"],
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};

export default config;

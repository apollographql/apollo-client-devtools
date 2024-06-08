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
        namingConvention: {
          typeNames: "keep",
        },
        nonOptionalTypename: true,
        omitOperationSuffix: true,
        scalars: {
          ID: "number",
          QueryData: "./scalars#QueryData",
          Variables: "./scalars#Variables",
          QueryOptions: "./scalars#QueryOptions",
          JSON: "./scalars#JSON",
          GraphQLErrorPath: "./scalars#GraphQLErrorPath",
        },
        skipTypeNameForRoot: true,
      },
      plugins: ["typescript", "typescript-operations"],
      hooks: {
        afterOneFileWrite: ["prettier --write"],
      },
    },
    "./src/application/types/resolvers.ts": {
      config: {
        defaultScalarType: "unknown",
        rootValueType: "never",
        useTypeImports: true,
      },
      plugins: [
        {
          add: {
            content: "/* eslint-disable @typescript-eslint/ban-types */",
          },
        },
        "typescript",
        "typescript-resolvers",
      ],
      hooks: {
        afterOneFileWrite: ["prettier --write"],
      },
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};

export default config;

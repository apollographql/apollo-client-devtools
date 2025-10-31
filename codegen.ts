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
        useTypeImports: true,
        scalars: {
          Cache: "./scalars#Cache",
          DateTime: "./scalars#DateTime",
          Diff: "@/application/utilities/diff#Diff",
          DocumentNode: "@apollo/client#DocumentNode",
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
        scalars: {
          DateTime: "./scalars#DateTime",
          Diff: "@/application/utilities/diff#Diff",
          DocumentNode: "@apollo/client#DocumentNode",
          QueryData: "./scalars#QueryData",
          Variables: "./scalars#Variables",
          QueryOptions: "./scalars#QueryOptions",
        },
        avoidOptionals: {
          field: true,
        },
        onlyResolveTypeForInterfaces: true,
        mappers: {
          CacheWrite:
            "@/extension/tab/shared/types.ts#CacheWrite as RemoteCacheWrite",
          Client: "@/types.ts#ApolloClientInfo",
          ClientV3: "@/types.ts#ApolloClientInfo",
          ClientV4: "@/types.ts#ApolloClientInfo",
          ClientV3Queries: "@/types.ts#ApolloClientInfo",
          ClientV4Queries: "@/types.ts#ApolloClientInfo",
          ClientV3Mutations: "@/types.ts#ApolloClientInfo",
          ClientV4Mutations: "@/types.ts#ApolloClientInfo",
          GraphQLDocument: "@apollo/client#DocumentNode",
          SerializedApolloError:
            "@/extension/tab/v3/types#SerializedApolloError as RpcSerializedApolloError",
          SerializedError: "@/types#SerializedError as RpcSerializedError",
          SerializedGraphQLError: "graphql#GraphQLFormattedError",
          SerializedCombinedGraphQLErrors:
            "@/extension/tab/v4/types#SerializedCombinedGraphQLErrors as RpcSerializedCombinedGraphQLErrors",
          SerializedCombinedProtocolErrors:
            "@/extension/tab/v4/types#SerializedCombinedProtocolErrors as RpcSerializedCombinedProtocolErrors",
          SerializedLocalStateError:
            "@/extension/tab/v4/types#SerializedLocalStateError as RpcSerializedLocalStateError",
          SerializedServerError:
            "@/extension/tab/v4/types#SerializedServerError as RpcSerializedServerError",
          SerializedServerParseError:
            "@/extension/tab/v4/types#SerializedServerParseError as RpcSerializedServerParseError",
          SerializedUnconventionalError:
            "@/extension/tab/v4/types#SerializedUnconventionalError as RpcSerializedUnconventionalError",
        },
        maybeValue: "T | null | undefined",
      },
      plugins: [
        {
          add: {
            content: "/* eslint-disable */",
          },
        },
        "typescript",
        "typescript-resolvers",
      ],
      hooks: {
        afterOneFileWrite: ["prettier --write"],
      },
    },

    "./src/application/possibleTypes.json": {
      plugins: ["fragment-matcher"],
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};

export default config;

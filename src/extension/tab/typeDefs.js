import { DocumentNode, print } from "graphql";

function normalizeTypeDefs(typeDefs) {
  const defs = Array.isArray(typeDefs) ? typeDefs : [typeDefs];
  return defs
    .map(typeDef => (typeof typeDef === "string" ? typeDef : print(typeDef)))
    .map(str => str.trim())
    .join("\n");
}

export function buildSchemasFromTypeDefs(typeDefs) {
  let schemas;
  if (typeDefs) {
    const directives = "directive @client on FIELD";
    const definition = normalizeTypeDefs(typeDefs);
    schemas = [{ definition, directives }];
  }
  return schemas;
}

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const ColorAPI = require("./api/color");
const db = require("./db");

const typeDefs = `#graphql
  enum Mode {
    MONOCHROME
    MONOCHROME_DARK
    MONOCHROME_LIGHT
    ANALOGIC
    COMPLEMENT
    ANALOGIC_COMPLEMENT
    TRIAD
    QUAD
  }

  type Color {
    name: String!
    hex: String!
    rgb: String!
    contrast: String!
  }

  type Scheme {
    mode: Mode!
    count: Int!
    colors: [Color]
  }

  type Random {
    color: Color
    scheme: Scheme
  }

  type Query {
    color(hex: String): Color
    random: Random
    scheme(hex: String, mode: Mode, count: Int): Scheme
    favoritedColors: [Color!]
  }

  input ColorInput {
    name: String!
    hex: String!
    contrast: String!
  }

  type Mutation {
    addColor(color: ColorInput!): [Color!]!
    removeColor(color: ColorInput!): [Color!]!
  }
`;

const resolvers = {
  Mutation: {
    addColor: async (_source, { color }, { dataSources }) => {
      const exists = dataSources.db
        .get("favorites")
        .find({ hex: color.hex })
        .value();

      if (exists) {
        return dataSources.db.get("favorites").value();
      }

      return dataSources.db.get("favorites").push(color).write();
    },
    removeColor: async (_source, { color }, { dataSources }) => {
      return dataSources.db.get("favorites").remove(color).write();
    },
  },
  Query: {
    random: () => ({}),
    color: async (_source, { hex }, { dataSources }) => {
      return dataSources.colorAPI.identifyColor({ hex });
    },
    scheme: async (_source, { hex, mode, count }, { dataSources }) => {
      return dataSources.colorAPI.getColorScheme({ hex, mode, count });
    },
    favoritedColors: async (_source, _, { dataSources }) => {
      return dataSources.db.get("favorites");
    },
  },
  Random: {
    color: async (_source, _, { dataSources }) => {
      return dataSources.colorAPI.getRandomColor();
    },
    scheme: async (_source, _, { dataSources }) => {
      return dataSources.colorAPI.getRandomScheme();
    },
  },
  Mode: {
    MONOCHROME: "monochrome",
    MONOCHROME_DARK: "monochrome-dark",
    MONOCHROME_LIGHT: "monochrome-light",
    ANALOGIC: "analogic",
    COMPLEMENT: "complement",
    ANALOGIC_COMPLEMENT: "analogic-complement",
    TRIAD: "triad",
    QUAD: "quad",
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // enable to test introspection failure handling
  // introspection: false,
});

startStandaloneServer(server, {
  context: () => {
    const { cache } = server;

    return {
      dataSources: {
        colorAPI: new ColorAPI({ cache }),
        db,
      },
    };
  },
}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

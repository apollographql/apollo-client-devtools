import { makeExecutableSchema } from "@graphql-tools/schema";
import { addMocksToSchema } from "@graphql-tools/mock";
import { GraphQLFieldResolver } from "graphql";

interface Author {
  id: number;
  firstName: string;
  lastName: string;
}

interface Post {
  id: number;
  title: string;
  authorId: number;
  votes: number;
}

const typeDefs = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    """
    the list of Posts by this author
    """
    posts: [Post]
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # the schema allows the following query:
  type Query {
    posts: [Post]
    author(id: Int!): Author
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }
`;

const authors: Author[] = [
  { id: 1, firstName: "Tom", lastName: "Coleman" },
  { id: 2, firstName: "Sashko", lastName: "Stubailo" },
  { id: 3, firstName: "Mikhail", lastName: "Novikov" },
];

const posts: Post[] = [
  { id: 1, authorId: 1, title: "Introduction to GraphQL", votes: 2 },
  { id: 2, authorId: 2, title: "Welcome to Meteor", votes: 3 },
  { id: 3, authorId: 2, title: "Advanced GraphQL", votes: 1 },
  { id: 4, authorId: 3, title: "Launchpad is Cool", votes: 7 },
];

const resolvers = {
  Query: {
    posts: () => posts,
    author: (_, { id }) => authors.find((author) => author.id === id),
  } satisfies {
    posts: GraphQLFieldResolver<unknown, unknown>;
    author: GraphQLFieldResolver<unknown, unknown, { id: number }>;
  },

  Mutation: {
    upvotePost: (_, { postId }) => {
      const post = posts.find((post) => post.id === postId);
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      return post;
    },
  } satisfies {
    upvotePost: GraphQLFieldResolver<unknown, unknown, { postId: number }>;
  },

  Author: {
    posts: (author) => posts.filter((post) => post.authorId === author.id),
  } satisfies {
    posts: GraphQLFieldResolver<Author, unknown>;
  },

  Post: {
    author: (post) => authors.find((author) => (author.id = post.authorId)),
  } satisfies {
    author: GraphQLFieldResolver<Post, unknown>;
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const schemaWithMocks = addMocksToSchema({ schema });
